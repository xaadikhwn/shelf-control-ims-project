const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/authenticate');

router.get('/summary', authenticate, controller.getSummary);
router.get('/', authenticate, controller.getSummary);

module.exports = router;
