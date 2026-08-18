const express = require('express');
const router = express.Router();
const controller = require('../controllers/payroll.controller');
const { authenticate, requireRole } = require('../middleware/authenticate');

router.get('/', authenticate, requireRole('Administrator', 'Manager'), controller.list);
router.post('/', authenticate, requireRole('Administrator'), controller.create);
router.post('/run', authenticate, requireRole('Administrator', 'Manager'), controller.runPayroll);

module.exports = router;
