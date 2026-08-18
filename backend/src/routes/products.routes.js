const express = require('express');
const router = express.Router();
const controller = require('../controllers/products.controller');
const { authenticate, requireRole } = require('../middleware/authenticate');

router.get('/', authenticate, controller.list);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, requireRole('Administrator', 'Manager'), controller.create);
router.put('/:id', authenticate, requireRole('Administrator', 'Manager'), controller.update);
router.delete('/:id', authenticate, requireRole('Administrator'), controller.delete);

module.exports = router;
