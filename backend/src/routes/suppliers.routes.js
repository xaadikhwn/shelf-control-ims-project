const express = require('express');
const router = express.Router();
const controller = require('../controllers/suppliers.controller');
const { authenticate, requireRole } = require('../middleware/authenticate');

router.get('/', authenticate, controller.list);
router.post('/', authenticate, requireRole('Administrator', 'Manager'), controller.create);
router.put('/:id', authenticate, requireRole('Administrator', 'Manager'), controller.update);
router.delete('/:id', authenticate, requireRole('Administrator', 'Manager'), controller.delete);
router.post('/:id/payments', authenticate, requireRole('Administrator', 'Manager'), controller.recordPayment);
router.post('/:id/purchases', authenticate, requireRole('Administrator', 'Manager'), controller.recordPurchase);

module.exports = router;
