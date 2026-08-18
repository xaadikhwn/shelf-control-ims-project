const bcrypt = require('bcryptjs');
const db = require('../models');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  generatePasswordResetToken,
} = require('../utils/tokens');

exports.register = async (req, res, next) => {
  try {
    const { full_name, email, password, role_id, role } = req.body;
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    if (!cleanEmail || !password) {
      const err = new Error('Email and password are required');
      err.statusCode = 400;
      return next(err);
    }

    const existingUser = await db.User.findOne({ where: { email: cleanEmail } });
    if (existingUser) {
      const err = new Error('Email already registered');
      err.statusCode = 409;
      return next(err);
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password.trim(), salt);

    let assignedRoleId = role_id;
    if (!assignedRoleId && role) {
      const roleObj = await db.Role.findOne({ where: { name: role } });
      if (roleObj) assignedRoleId = roleObj.id;
    }
    if (!assignedRoleId) {
      const userRole = await db.Role.findOne({ where: { name: 'User' } });
      if (userRole) assignedRoleId = userRole.id;
    }

    const user = await db.User.create({
      full_name: full_name || cleanEmail.split('@')[0],
      email: cleanEmail,
      password_hash,
      role_id: assignedRoleId,
      is_active: true
    });

    const userWithRole = await db.User.findByPk(user.id, {
      include: [{ model: db.Role }]
    });

    const accessToken = generateAccessToken(userWithRole);
    const refreshToken = generateRefreshToken(userWithRole);

    await db.RefreshToken.create({
      user_id: user.id,
      token_hash: hashToken(refreshToken),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      data: {
        accessToken,
        user: {
          id: userWithRole.id,
          full_name: userWithRole.full_name,
          email: userWithRole.email,
          role: userWithRole.Role ? userWithRole.Role.name : 'User'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const err = new Error('Email and password are required');
      err.statusCode = 400;
      return next(err);
    }

    const cleanInput = email.trim().toLowerCase();

    // Exact match only. Do not fuzzy-match by name/partial email, and do not
    // reveal which part of the credential pair was wrong, or which accounts
    // exist — both are classic user-enumeration vectors.
    const user = await db.User.findOne({
      where: { email: cleanInput },
      include: [{ model: db.Role }]
    });

    const genericError = () => {
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
      });
    };

    if (!user || !user.is_active) {
      return genericError();
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password_hash);
    if (!isMatch) {
      return genericError();
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await db.RefreshToken.create({
      user_id: user.id,
      token_hash: hashToken(refreshToken),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    user.last_login_at = new Date();
    await user.save();

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.Role ? user.Role.name : 'User'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const tokenRecord = await db.RefreshToken.findOne({ where: { token_hash: hashToken(refreshToken) } });
      if (tokenRecord) {
        tokenRecord.revoked_at = new Date();
        await tokenRecord.save();
      }
    }

    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        id: req.user.id,
        full_name: req.user.full_name,
        email: req.user.email,
        role: req.user.Role ? req.user.Role.name : 'User',
        avatar_url: req.user.avatar_url
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: { message: 'No refresh token provided' }
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired refresh token' }
      });
    }

    const tokenRecord = await db.RefreshToken.findOne({
      where: { token_hash: hashToken(refreshToken) }
    });

    if (!tokenRecord || tokenRecord.revoked_at || tokenRecord.expires_at < new Date()) {
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid or revoked refresh token' }
      });
    }

    const user = await db.User.findByPk(decoded.userId, {
      include: [{ model: db.Role }]
    });

    if (!user || !user.is_active) {
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        error: { message: 'User account not found or inactive' }
      });
    }

    const newAccessToken = generateAccessToken(user);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.Role ? user.Role.name : 'User'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Real password-reset flow, backed by the password_reset_tokens table.
// No email provider is configured in this environment, so in non-production
// environments the raw token is included in the response and logged
// server-side so the flow can be exercised end-to-end; in production it is
// never returned in the response body — it must be emailed out by a
// configured provider.
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const genericMessage = 'If an account with that email exists, a reset link has been sent.';
    const cleanEmail = (email || '').trim().toLowerCase();

    const user = await db.User.findOne({ where: { email: cleanEmail } });
    if (!user) {
      return res.status(200).json({ success: true, message: genericMessage });
    }

    const { rawToken, tokenHash } = generatePasswordResetToken();
    await db.PasswordResetToken.create({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 60 * 60 * 1000),
    });

    const isProduction = process.env.NODE_ENV === 'production';
    console.log(`[password-reset] token for ${cleanEmail}: ${rawToken} (expires in 1h)`);

    res.status(200).json({
      success: true,
      message: genericMessage,
      ...(isProduction ? {} : { devResetToken: rawToken }),
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  const t = await db.sequelize.transaction();
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) {
      const err = new Error('Token and new password are required');
      err.statusCode = 400;
      throw err;
    }
    const tokenHash = hashToken(token);

    const tokenRecord = await db.PasswordResetToken.findOne({
      where: { token_hash: tokenHash },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!tokenRecord || tokenRecord.used_at || tokenRecord.expires_at < new Date()) {
      const err = new Error('Invalid or expired reset token');
      err.statusCode = 400;
      throw err;
    }

    const user = await db.User.findByPk(tokenRecord.user_id, { transaction: t });
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const salt = await bcrypt.genSalt(12);
    user.password_hash = await bcrypt.hash(new_password, salt);
    await user.save({ transaction: t });

    tokenRecord.used_at = new Date();
    await tokenRecord.save({ transaction: t });

    // A password reset should end every other active session.
    await db.RefreshToken.update(
      { revoked_at: new Date() },
      { where: { user_id: user.id, revoked_at: null }, transaction: t }
    );

    await t.commit();
    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
