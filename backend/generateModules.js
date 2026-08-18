const fs = require('fs');
const path = require('path');

const modules = [
  'dashboard', 'sales', 'inventory', 'payroll', 'expenses', 'customers', 'suppliers', 'users'
];

modules.forEach(mod => {
  // Routes
  const routeContent = \`const express = require('express');
const router = express.Router();
const controller = require('../controllers/\${mod}.controller');
const { authenticate, requireRole } = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const { paginatedQuerySchema } = require('../validators');

// Add routes here
router.get('/', authenticate, validate(paginatedQuerySchema), controller.list);

module.exports = router;
\`;
  fs.writeFileSync(path.join(__dirname, 'src', 'routes', \`\${mod}.routes.js\`), routeContent);

  // Controllers
  const controllerContent = \`const db = require('../models');

exports.list = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Replace 'Model' with actual model
    // const { count, rows } = await db.Model.findAndCountAll({ limit, offset });

    res.status(200).json({
      success: true,
      data: [], // rows
      meta: { page, limit, total: 0 } // count
    });
  } catch (error) {
    next(error);
  }
};
\`;
  fs.writeFileSync(path.join(__dirname, 'src', 'controllers', \`\${mod}.controller.js\`), controllerContent);
});

console.log('Modules generated.');
