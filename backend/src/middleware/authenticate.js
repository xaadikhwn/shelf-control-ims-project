const jwt = require('jsonwebtoken');
const db = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const err = new Error('No token provided');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    const token = authHeader.split(' ')[1];
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'your_access_secret_key_here');
    } catch (err) {
      const error = new Error('Invalid or expired token');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      return next(error);
    }

    const user = await db.User.findByPk(decoded.userId, {
      include: [{ model: db.Role }]
    });

    if (!user || !user.is_active) {
      const err = new Error('User not found or inactive');
      err.statusCode = 401;
      err.code = 'UNAUTHORIZED';
      return next(err);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.Role || !roles.includes(req.user.Role.name)) {
      const err = new Error('Forbidden: Insufficient privileges');
      err.statusCode = 403;
      err.code = 'FORBIDDEN';
      return next(err);
    }
    next();
  };
};

module.exports = { authenticate, requireRole };
