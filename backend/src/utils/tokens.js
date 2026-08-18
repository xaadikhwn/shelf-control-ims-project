const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.Role?.name },
    process.env.JWT_ACCESS_SECRET || 'your_access_secret_key_here',
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key_here',
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key_here');
};

// Deterministic one-way hash for storing/looking up opaque tokens (refresh
// tokens, password reset tokens). Unlike bcrypt, this must be deterministic
// so we can find the matching DB row from the plaintext token the client
// presents — bcrypt's salting makes it unsuitable for this lookup pattern.
// The tokens themselves are already high-entropy (signed JWTs /
// crypto.randomBytes), so SHA-256 is appropriate here — this is not password storage.
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const generatePasswordResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  return { rawToken, tokenHash: hashToken(rawToken) };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  generatePasswordResetToken,
};
