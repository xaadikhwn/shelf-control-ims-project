'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash('admin123', salt);

    // 1. Roles
    await queryInterface.bulkInsert('Roles', [
      { id: 1, name: 'Administrator', description: 'Full system control', created_at: new Date(), updated_at: new Date() },
      { id: 2, name: 'Manager', description: 'Management and operational access', created_at: new Date(), updated_at: new Date() },
      { id: 3, name: 'User', description: 'Standard user access', created_at: new Date(), updated_at: new Date() }
    ], { ignoreDuplicates: true });

    // 2. Users
    await queryInterface.bulkInsert('Users', [
      {
        full_name: 'System Admin',
        email: 'admin@bizmanage.com',
        password_hash: passwordHash,
        role_id: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        full_name: 'Operations Manager',
        email: 'manager@bizmanage.com',
        password_hash: passwordHash,
        role_id: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        full_name: 'Regular Staff',
        email: 'user@bizmanage.com',
        password_hash: passwordHash,
        role_id: 3,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], { ignoreDuplicates: true });

    // 3. Categories
    await queryInterface.bulkInsert('Categories', [
      { id: 1, name: 'Textiles', description: 'Fabrics and raw text materials', created_at: new Date(), updated_at: new Date() },
      { id: 2, name: 'Accessories', description: 'Buttons, zippers, elastic, thread', created_at: new Date(), updated_at: new Date() },
      { id: 3, name: 'Equipment', description: 'Machinery and tools', created_at: new Date(), updated_at: new Date() },
      { id: 4, name: 'Supplies', description: 'Dyes, packaging, consumable supplies', created_at: new Date(), updated_at: new Date() }
    ], { ignoreDuplicates: true });

    // 4. Products
    await queryInterface.bulkInsert('Products', [
      { sku: 'PRD-001', name: 'Premium Cotton Fabric (50m roll)', category_id: 1, quantity: 145, reorder_point: 50, cost_price: 28.50, sale_price: 42.00, status: 'in-stock', created_at: new Date(), updated_at: new Date() },
      { sku: 'PRD-002', name: 'Industrial Sewing Thread (1000m)', category_id: 2, quantity: 12, reorder_point: 30, cost_price: 3.20, sale_price: 6.50, status: 'low-stock', created_at: new Date(), updated_at: new Date() },
      { sku: 'PRD-003', name: 'Polyester Blend (100m roll)', category_id: 1, quantity: 0, reorder_point: 40, cost_price: 19.80, sale_price: 31.00, status: 'out-of-stock', created_at: new Date(), updated_at: new Date() },
      { sku: 'PRD-004', name: 'Metal Zippers (pack of 50)', category_id: 2, quantity: 380, reorder_point: 100, cost_price: 8.40, sale_price: 15.00, status: 'in-stock', created_at: new Date(), updated_at: new Date() },
      { sku: 'PRD-005', name: 'Embroidery Machine Needles', category_id: 3, quantity: 8, reorder_point: 25, cost_price: 12.00, sale_price: 22.00, status: 'low-stock', created_at: new Date(), updated_at: new Date() },
      { sku: 'PRD-006', name: 'Linen Fabric (50m roll)', category_id: 1, quantity: 78, reorder_point: 30, cost_price: 35.00, sale_price: 55.00, status: 'in-stock', created_at: new Date(), updated_at: new Date() },
      { sku: 'PRD-007', name: 'Fabric Dye Set (12 colours)', category_id: 4, quantity: 0, reorder_point: 15, cost_price: 24.00, sale_price: 40.00, status: 'out-of-stock', created_at: new Date(), updated_at: new Date() },
      { sku: 'PRD-008', name: 'Elastic Band (100m roll)', category_id: 2, quantity: 52, reorder_point: 20, cost_price: 5.50, sale_price: 10.00, status: 'in-stock', created_at: new Date(), updated_at: new Date() }
    ], { ignoreDuplicates: true });

    // 5. Customers
    await queryInterface.bulkInsert('Customers', [
      { id: 1, account_code: 'CUST-001', company_name: 'Ahmed Textiles Ltd', contact_person: 'Raza Ahmed', phone: '+44 7700 900123', credit_limit: 25000, status: 'active', created_at: new Date(), updated_at: new Date() },
      { id: 2, account_code: 'CUST-002', company_name: 'Khan & Brothers Trading', contact_person: 'Shahid Khan', phone: '+44 7700 900456', credit_limit: 15000, status: 'active', created_at: new Date(), updated_at: new Date() },
      { id: 3, account_code: 'CUST-003', company_name: 'Malik Distributors', contact_person: 'Imran Malik', phone: '+44 7700 900789', credit_limit: 20000, status: 'warning', created_at: new Date(), updated_at: new Date() },
      { id: 4, account_code: 'CUST-004', company_name: 'Sunrise Retail Co.', contact_person: 'Priya Sharma', phone: '+44 7700 900321', credit_limit: 10000, status: 'active', created_at: new Date(), updated_at: new Date() }
    ], { ignoreDuplicates: true });

    // 6. Suppliers
    await queryInterface.bulkInsert('Suppliers', [
      { id: 1, vendor_code: 'VND-001', company_name: 'Global Fabrics Ltd', contact_person: 'James Wilson', phone: '+44 20 7946 0912', country: 'United Kingdom', credit_terms: 'Net 30', status: 'active', created_at: new Date(), updated_at: new Date() },
      { id: 2, vendor_code: 'VND-002', company_name: 'Eastern Thread Co.', contact_person: 'Li Wei', phone: '+86 21 6123 4567', country: 'China', credit_terms: 'Net 45', status: 'active', created_at: new Date(), updated_at: new Date() },
      { id: 3, vendor_code: 'VND-003', company_name: 'Textile Innovations Inc.', contact_person: 'Sarah Johnson', phone: '+1 212 555 0198', country: 'United States', credit_terms: 'Net 30', status: 'active', created_at: new Date(), updated_at: new Date() }
    ], { ignoreDuplicates: true });

    // 7. Employees
    await queryInterface.bulkInsert('Employees', [
      { id: 1, emp_code: 'EMP-001', full_name: 'Sarah Mitchell', department: 'Sales', role_title: 'Sales Manager', gross_salary: 3800.00, status: 'active', created_at: new Date(), updated_at: new Date() },
      { id: 2, emp_code: 'EMP-002', full_name: 'David Chen', department: 'Operations', role_title: 'Operations Lead', gross_salary: 3200.00, status: 'active', created_at: new Date(), updated_at: new Date() },
      { id: 3, emp_code: 'EMP-003', full_name: 'Emma Thompson', department: 'Finance', role_title: 'Accountant', gross_salary: 2900.00, status: 'active', created_at: new Date(), updated_at: new Date() },
      { id: 4, emp_code: 'EMP-004', full_name: 'James Rodriguez', department: 'Warehouse', role_title: 'Stock Controller', gross_salary: 2400.00, status: 'active', created_at: new Date(), updated_at: new Date() }
    ], { ignoreDuplicates: true });

    // 8. Expenses
    await queryInterface.bulkInsert('Expenses', [
      { id: 1, ref_code: 'EXP-001', description: 'Warehouse Rental — Current Month', category: 'Rent', amount: 3500.00, expense_date: new Date(), submitted_by: 1, status: 'approved', created_at: new Date(), updated_at: new Date() },
      { id: 2, ref_code: 'EXP-002', description: 'Fleet Vehicle Servicing', category: 'Transport', amount: 840.00, expense_date: new Date(), submitted_by: 1, status: 'approved', created_at: new Date(), updated_at: new Date() },
      { id: 3, ref_code: 'EXP-003', description: 'Office Supplies & Stationery', category: 'Office', amount: 185.00, expense_date: new Date(), submitted_by: 2, status: 'pending', created_at: new Date(), updated_at: new Date() }
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Expenses', null, {});
    await queryInterface.bulkDelete('Employees', null, {});
    await queryInterface.bulkDelete('Suppliers', null, {});
    await queryInterface.bulkDelete('Customers', null, {});
    await queryInterface.bulkDelete('Products', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Roles', null, {});
  }
};
