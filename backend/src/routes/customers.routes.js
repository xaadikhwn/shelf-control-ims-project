const express = require('express');
const router = express.Router();
const controller = require('../controllers/customers.controller');
const { authenticate, requireRole } = require('../middleware/authenticate');

router.get('/', authenticate, controller.list);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, controller.create);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.delete);
router.post('/:id/payments', authenticate, controller.recordPayment);

module.exports = router;
