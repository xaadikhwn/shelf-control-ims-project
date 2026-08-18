const rateLimit = require('express-rate-limit');

const { ipKeyGenerator } = rateLimit;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs for auth routes
  keyGenerator: ipKeyGenerator,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again after 15 minutes'
    }
  }
});

const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  keyGenerator: ipKeyGenerator,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later'
    }
  }
});

module.exports = { authLimiter, globalLimiter };
