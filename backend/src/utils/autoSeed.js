const bcrypt = require('bcryptjs');
const db = require('../models');

async function autoSeed() {
  try {
    // 1. Roles
    await db.Role.bulkCreate([
      { id: 1, name: 'Administrator', description: 'Full system control' },
      { id: 2, name: 'Manager', description: 'Management and operational access' },
      { id: 3, name: 'User', description: 'Standard user access' }
    ], { ignoreDuplicates: true });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    // Default system users with deterministic admin123 password
    const usersToSeed = [
      {
        full_name: 'System Admin',
        email: 'admin@bizmanage.com',
        password_hash: passwordHash,
        role_id: 1,
        is_active: true
      },
      {
        full_name: 'Test Admin',
        email: 'testadmin@bizmanage.com',
        password_hash: passwordHash,
        role_id: 1,
        is_active: true
      },
      {
        full_name: 'Operations Manager',
        email: 'manager@bizmanage.com',
        password_hash: passwordHash,
        role_id: 2,
        is_active: true
      },
      {
        full_name: 'Regular Staff',
        email: 'user@bizmanage.com',
        password_hash: passwordHash,
        role_id: 3,
        is_active: true
      },
      {
        full_name: 'Alex Rivera',
        email: 'alex.rivera@bizmanage.com',
        password_hash: passwordHash,
        role_id: 3,
        is_active: true
      }
    ];

    for (const u of usersToSeed) {
      const existing = await db.User.findOne({ where: { email: u.email } });
      if (!existing) {
        await db.User.create(u);
      } else {
        existing.password_hash = passwordHash;
        existing.is_active = true;
        await existing.save();
      }
    }

    // Categories
    const categoryCount = await db.Category.count();
    if (categoryCount === 0) {
      await db.Category.bulkCreate([
        { id: 1, name: 'Textiles', description: 'Fabrics and raw text materials' },
        { id: 2, name: 'Accessories', description: 'Buttons, zippers, elastic, thread' },
        { id: 3, name: 'Equipment', description: 'Machinery and tools' },
        { id: 4, name: 'Supplies', description: 'Dyes, packaging, consumable supplies' }
      ], { ignoreDuplicates: true });
    }

    // Products
    const productCount = await db.Product.count();
    if (productCount === 0) {
      await db.Product.bulkCreate([
        { sku: 'PRD-001', name: 'Premium Cotton Fabric (50m roll)', category_id: 1, quantity: 145, reorder_point: 50, cost_price: 28.50, sale_price: 42.00, status: 'in-stock' },
        { sku: 'PRD-002', name: 'Industrial Sewing Thread (1000m)', category_id: 2, quantity: 12, reorder_point: 30, cost_price: 3.20, sale_price: 6.50, status: 'low-stock' },
        { sku: 'PRD-003', name: 'Polyester Blend (100m roll)', category_id: 1, quantity: 0, reorder_point: 40, cost_price: 19.80, sale_price: 31.00, status: 'out-of-stock' },
        { sku: 'PRD-004', name: 'Metal Zippers (pack of 50)', category_id: 2, quantity: 380, reorder_point: 100, cost_price: 8.40, sale_price: 15.00, status: 'in-stock' },
        { sku: 'PRD-005', name: 'Embroidery Machine Needles', category_id: 3, quantity: 8, reorder_point: 25, cost_price: 12.00, sale_price: 22.00, status: 'low-stock' },
        { sku: 'PRD-006', name: 'Linen Fabric (50m roll)', category_id: 1, quantity: 78, reorder_point: 30, cost_price: 35.00, sale_price: 55.00, status: 'in-stock' },
        { sku: 'PRD-007', name: 'Fabric Dye Set (12 colours)', category_id: 4, quantity: 0, reorder_point: 15, cost_price: 24.00, sale_price: 40.00, status: 'out-of-stock' },
        { sku: 'PRD-008', name: 'Elastic Band (100m roll)', category_id: 2, quantity: 52, reorder_point: 20, cost_price: 5.50, sale_price: 10.00, status: 'in-stock' }
      ], { ignoreDuplicates: true });
    }

    // Customers
    const customerCount = await db.Customer.count();
    if (customerCount === 0) {
      await db.Customer.bulkCreate([
        { account_code: 'CUST-001', company_name: 'Ahmed Textiles Ltd', contact_person: 'Raza Ahmed', phone: '+44 7700 900123', credit_limit: 25000, status: 'active' },
        { account_code: 'CUST-002', company_name: 'Khan & Brothers Trading', contact_person: 'Shahid Khan', phone: '+44 7700 900456', credit_limit: 15000, status: 'active' },
        { account_code: 'CUST-003', company_name: 'Malik Distributors', contact_person: 'Imran Malik', phone: '+44 7700 900789', credit_limit: 20000, status: 'warning' },
        { account_code: 'CUST-004', company_name: 'Sunrise Retail Co.', contact_person: 'Priya Sharma', phone: '+44 7700 900321', credit_limit: 10000, status: 'active' }
      ], { ignoreDuplicates: true });
    }

    // Suppliers
    const supplierCount = await db.Supplier.count();
    if (supplierCount === 0) {
      await db.Supplier.bulkCreate([
        { vendor_code: 'VND-001', company_name: 'Global Fabrics Ltd', contact_person: 'James Wilson', phone: '+44 20 7946 0912', country: 'United Kingdom', credit_terms: 'Net 30', status: 'active' },
        { vendor_code: 'VND-002', company_name: 'Eastern Thread Co.', contact_person: 'Li Wei', phone: '+86 21 6123 4567', country: 'China', credit_terms: 'Net 45', status: 'active' },
        { vendor_code: 'VND-003', company_name: 'Textile Innovations Inc.', contact_person: 'Sarah Johnson', phone: '+1 212 555 0198', country: 'United States', credit_terms: 'Net 30', status: 'active' }
      ], { ignoreDuplicates: true });
    }

    // Employees
    const employeesToSeed = [
      { emp_code: 'EMP-001', full_name: 'Sarah Mitchell', department: 'Sales', role_title: 'Sales Manager', gross_salary: 3800.00, status: 'active' },
      { emp_code: 'EMP-002', full_name: 'David Chen', department: 'Operations', role_title: 'Operations Lead', gross_salary: 3200.00, status: 'active' },
      { emp_code: 'EMP-003', full_name: 'Emma Thompson', department: 'Finance', role_title: 'Accountant', gross_salary: 2900.00, status: 'active' },
      { emp_code: 'EMP-004', full_name: 'James Rodriguez', department: 'Warehouse', role_title: 'Stock Controller', gross_salary: 2400.00, status: 'active' },
      { emp_code: 'EMP-005', full_name: 'Alex Rivera', department: 'Inventory', role_title: 'Inventory Specialist', gross_salary: 2800.00, status: 'active' }
    ];

    for (const e of employeesToSeed) {
      const existingEmp = await db.Employee.findOne({ where: { emp_code: e.emp_code } });
      if (!existingEmp) {
        await db.Employee.create(e);
      }
    }

    // Expenses
    const expenseCount = await db.Expense.count();
    if (expenseCount === 0) {
      await db.Expense.bulkCreate([
        { ref_code: 'EXP-001', description: 'Warehouse Rental — Current Month', category: 'Rent', amount: 3500.00, expense_date: new Date(), submitted_by: 1, status: 'approved' },
        { ref_code: 'EXP-002', description: 'Fleet Vehicle Servicing', category: 'Transport', amount: 840.00, expense_date: new Date(), submitted_by: 1, status: 'approved' },
        { ref_code: 'EXP-003', description: 'Office Supplies & Stationery', category: 'Office', amount: 185.00, expense_date: new Date(), submitted_by: 2, status: 'pending' }
      ], { ignoreDuplicates: true });
    }
    console.log('Database auto-seeded successfully with verified credentials (admin123).');
  } catch (error) {
    console.error('Auto-seed error:', error.message);
  }
}

module.exports = { autoSeed };
