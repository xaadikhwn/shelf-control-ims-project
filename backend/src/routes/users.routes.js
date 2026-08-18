const express = require('express');
const router = express.Router();
const controller = require('../controllers/users.controller');
const { authenticate, requireRole } = require('../middleware/authenticate');

router.get('/', authenticate, requireRole('Administrator'), controller.list);
router.patch('/:id/role', authenticate, requireRole('Administrator'), controller.updateRole);

module.exports = router;
