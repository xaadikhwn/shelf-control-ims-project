const fs = require('fs');
const path = require('path');

const models = [
  { name: 'Roles', fields: "name: { type: Sequelize.STRING, allowNull: false, unique: true }, description: { type: Sequelize.STRING }" },
  { name: 'Users', fields: "full_name: { type: Sequelize.STRING, allowNull: false }, email: { type: Sequelize.STRING, allowNull: false, unique: true }, password_hash: { type: Sequelize.STRING, allowNull: false }, role_id: { type: Sequelize.INTEGER, references: { model: 'Roles', key: 'id' } }, avatar_url: { type: Sequelize.STRING }, is_active: { type: Sequelize.BOOLEAN, defaultValue: true }, last_login_at: { type: Sequelize.DATE }" },
  { name: 'PasswordResetTokens', fields: "user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } }, token_hash: { type: Sequelize.STRING, allowNull: false }, expires_at: { type: Sequelize.DATE, allowNull: false }, used_at: { type: Sequelize.DATE }" },
  { name: 'RefreshTokens', fields: "user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } }, token_hash: { type: Sequelize.STRING, allowNull: false }, expires_at: { type: Sequelize.DATE, allowNull: false }, revoked_at: { type: Sequelize.DATE }" },
  { name: 'Categories', fields: "name: { type: Sequelize.STRING, allowNull: false }, description: { type: Sequelize.TEXT }" },
  { name: 'Products', fields: "sku: { type: Sequelize.STRING, allowNull: false, unique: true }, name: { type: Sequelize.STRING, allowNull: false }, category_id: { type: Sequelize.INTEGER, references: { model: 'Categories', key: 'id' } }, quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 }, reorder_point: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 }, cost_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false }, sale_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false }, status: { type: Sequelize.ENUM('in-stock', 'low-stock', 'out-of-stock'), defaultValue: 'out-of-stock' }" },
  { name: 'StockAlerts', fields: "product_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Products', key: 'id' } }, triggered_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }, quantity_at_trigger: { type: Sequelize.INTEGER, allowNull: false }, threshold_at_trigger: { type: Sequelize.INTEGER, allowNull: false }, resolved_at: { type: Sequelize.DATE }" },
  { name: 'Customers', fields: "account_code: { type: Sequelize.STRING, allowNull: false, unique: true }, company_name: { type: Sequelize.STRING, allowNull: false }, contact_person: { type: Sequelize.STRING }, phone: { type: Sequelize.STRING }, email: { type: Sequelize.STRING }, credit_limit: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 }, last_order_at: { type: Sequelize.DATE }, status: { type: Sequelize.ENUM('active', 'warning', 'overdue'), defaultValue: 'active' }" },
  { name: 'CustomerAccountEntries', fields: "customer_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Customers', key: 'id' } }, entry_type: { type: Sequelize.ENUM('sale', 'payment', 'adjustment'), allowNull: false }, reference: { type: Sequelize.STRING }, amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false }, balance_after: { type: Sequelize.DECIMAL(10, 2), allowNull: false }" },
  { name: 'Suppliers', fields: "vendor_code: { type: Sequelize.STRING, allowNull: false, unique: true }, company_name: { type: Sequelize.STRING, allowNull: false }, contact_person: { type: Sequelize.STRING }, phone: { type: Sequelize.STRING }, country: { type: Sequelize.STRING }, credit_terms: { type: Sequelize.STRING }, last_invoice_at: { type: Sequelize.DATE }, status: { type: Sequelize.ENUM('active', 'inactive'), defaultValue: 'active' }" },
  { name: 'SupplierAccountEntries', fields: "supplier_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Suppliers', key: 'id' } }, entry_type: { type: Sequelize.ENUM('purchase', 'payment', 'adjustment'), allowNull: false }, reference: { type: Sequelize.STRING }, amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false }, balance_after: { type: Sequelize.DECIMAL(10, 2), allowNull: false }" },
  { name: 'SalesOrders', fields: "order_code: { type: Sequelize.STRING, allowNull: false, unique: true }, customer_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Customers', key: 'id' } }, order_date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }, total_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false }, order_status: { type: Sequelize.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'), defaultValue: 'pending' }, payment_status: { type: Sequelize.ENUM('paid', 'credit', 'pending', 'refunded'), defaultValue: 'pending' }, created_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } }" },
  { name: 'SaleLines', fields: "sales_order_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'SalesOrders', key: 'id' } }, product_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Products', key: 'id' } }, quantity: { type: Sequelize.INTEGER, allowNull: false }, unit_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false }, line_total: { type: Sequelize.DECIMAL(10, 2), allowNull: false }", timestamps: false },
  { name: 'PurchaseOrders', fields: "order_code: { type: Sequelize.STRING, allowNull: false, unique: true }, supplier_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Suppliers', key: 'id' } }, order_date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }, total_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false }, status: { type: Sequelize.ENUM('pending', 'received', 'cancelled'), defaultValue: 'pending' }, created_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } }" },
  { name: 'PurchaseOrderLines', fields: "purchase_order_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'PurchaseOrders', key: 'id' } }, product_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Products', key: 'id' } }, quantity: { type: Sequelize.INTEGER, allowNull: false }, unit_cost: { type: Sequelize.DECIMAL(10, 2), allowNull: false }, line_total: { type: Sequelize.DECIMAL(10, 2), allowNull: false }", timestamps: false },
  { name: 'Employees', fields: "emp_code: { type: Sequelize.STRING, allowNull: false, unique: true }, full_name: { type: Sequelize.STRING, allowNull: false }, department: { type: Sequelize.STRING }, role_title: { type: Sequelize.STRING }, gross_salary: { type: Sequelize.DECIMAL(10, 2), allowNull: false }, status: { type: Sequelize.ENUM('active', 'inactive'), defaultValue: 'active' }" },
  { name: 'PayrollRuns', fields: "period_month: { type: Sequelize.INTEGER, allowNull: false }, period_year: { type: Sequelize.INTEGER, allowNull: false }, status: { type: Sequelize.ENUM('pending', 'processed'), defaultValue: 'pending' }, processed_at: { type: Sequelize.DATE }" },
  { name: 'PayrollEntries', fields: "payroll_run_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'PayrollRuns', key: 'id' } }, employee_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Employees', key: 'id' } }, gross: { type: Sequelize.DECIMAL(10, 2), allowNull: false }, deductions: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }, net_pay: { type: Sequelize.DECIMAL(10, 2), allowNull: false }, pay_date: { type: Sequelize.DATE }, status: { type: Sequelize.ENUM('paid', 'pending'), defaultValue: 'pending' }", timestamps: false },
  { name: 'Expenses', fields: "ref_code: { type: Sequelize.STRING, allowNull: false, unique: true }, description: { type: Sequelize.STRING, allowNull: false }, category: { type: Sequelize.STRING, allowNull: false }, amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false }, expense_date: { type: Sequelize.DATE, allowNull: false }, submitted_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } }, status: { type: Sequelize.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' }" }
];

let upCode = [];
let downCode = [];

models.forEach(model => {
  let fieldsStr = model.fields;
  
  let baseFields = "id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER }, ";
  if (model.timestamps !== false) {
    fieldsStr += ", created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW }, updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW }";
  }
  
  upCode.push("    await queryInterface.createTable('" + model.name + "', { " + baseFields + fieldsStr + " });");
});

models.slice().reverse().forEach(model => {
  downCode.push("    await queryInterface.dropTable('" + model.name + "');");
});

const content = [
  "'use strict';",
  "module.exports = {",
  "  async up(queryInterface, Sequelize) {",
  upCode.join('\n'),
  "  },",
  "  async down(queryInterface, Sequelize) {",
  downCode.join('\n'),
  "  }",
  "};"
].join('\n');

fs.writeFileSync(path.join(__dirname, 'src', 'migrations', '20260727000000-initial-schema.js'), content);
console.log("Migration generated.");
