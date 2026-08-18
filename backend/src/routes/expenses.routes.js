const express = require('express');
const router = express.Router();
const controller = require('../controllers/expenses.controller');
const { authenticate, requireRole } = require('../middleware/authenticate');

router.get('/', authenticate, controller.list);
router.post('/', authenticate, controller.create);
router.put('/:id', authenticate, requireRole('Administrator', 'Manager'), controller.update);
router.patch('/:id/status', authenticate, requireRole('Administrator', 'Manager'), controller.updateStatus);
router.delete('/:id', authenticate, requireRole('Administrator', 'Manager'), controller.delete);

module.exports = router;
