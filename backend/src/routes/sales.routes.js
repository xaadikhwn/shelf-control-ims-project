const express = require('express');
const router = express.Router();
const controller = require('../controllers/sales.controller');
const { authenticate, requireRole } = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const { paginatedQuerySchema, createSaleSchema } = require('../validators');

router.get('/', authenticate, validate(paginatedQuerySchema), controller.list);
router.get('/:id', authenticate, controller.getById);
router.post('/', authenticate, validate(createSaleSchema), controller.create);

module.exports = router;
