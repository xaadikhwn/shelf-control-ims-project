const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/authenticate');
const { authLimiter } = require('../middleware/rateLimit');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);
router.post('/refresh', authController.refresh);

module.exports = router;
