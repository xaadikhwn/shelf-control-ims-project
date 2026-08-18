const fs = require('fs');
const path = require('path');

const models = [
  {
    name: 'Role',
    fields: "name: { type: DataTypes.STRING, allowNull: false, unique: true }, description: { type: DataTypes.STRING }"
  },
  {
    name: 'User',
    fields: "full_name: { type: DataTypes.STRING, allowNull: false }, email: { type: DataTypes.STRING, allowNull: false, unique: true }, password_hash: { type: DataTypes.STRING, allowNull: false }, role_id: { type: DataTypes.INTEGER, references: { model: 'roles', key: 'id' } }, avatar_url: { type: DataTypes.STRING }, is_active: { type: DataTypes.BOOLEAN, defaultValue: true }, last_login_at: { type: DataTypes.DATE }",
    associations: "User.belongsTo(models.Role, { foreignKey: 'role_id' });"
  },
  {
    name: 'PasswordResetToken',
    fields: "user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } }, token_hash: { type: DataTypes.STRING, allowNull: false }, expires_at: { type: DataTypes.DATE, allowNull: false }, used_at: { type: DataTypes.DATE }",
    associations: "PasswordResetToken.belongsTo(models.User, { foreignKey: 'user_id' });"
  },
  {
    name: 'RefreshToken',
    fields: "user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } }, token_hash: { type: DataTypes.STRING, allowNull: false }, expires_at: { type: DataTypes.DATE, allowNull: false }, revoked_at: { type: DataTypes.DATE }",
    associations: "RefreshToken.belongsTo(models.User, { foreignKey: 'user_id' });"
  },
  {
    name: 'Category',
    fields: "name: { type: DataTypes.STRING, allowNull: false }, description: { type: DataTypes.TEXT }"
  },
  {
    name: 'Product',
    fields: "sku: { type: DataTypes.STRING, allowNull: false, unique: true }, name: { type: DataTypes.STRING, allowNull: false }, category_id: { type: DataTypes.INTEGER, references: { model: 'categories', key: 'id' } }, quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, reorder_point: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, cost_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, sale_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, status: { type: DataTypes.ENUM('in-stock', 'low-stock', 'out-of-stock'), defaultValue: 'out-of-stock' }",
    associations: "Product.belongsTo(models.Category, { foreignKey: 'category_id' });"
  },
  {
    name: 'StockAlert',
    fields: "product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'products', key: 'id' } }, triggered_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }, quantity_at_trigger: { type: DataTypes.INTEGER, allowNull: false }, threshold_at_trigger: { type: DataTypes.INTEGER, allowNull: false }, resolved_at: { type: DataTypes.DATE }",
    associations: "StockAlert.belongsTo(models.Product, { foreignKey: 'product_id' });"
  },
  {
    name: 'Customer',
    fields: "account_code: { type: DataTypes.STRING, allowNull: false, unique: true }, company_name: { type: DataTypes.STRING, allowNull: false }, contact_person: { type: DataTypes.STRING }, phone: { type: DataTypes.STRING }, email: { type: DataTypes.STRING }, credit_limit: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }, last_order_at: { type: DataTypes.DATE }, status: { type: DataTypes.ENUM('active', 'warning', 'overdue'), defaultValue: 'active' }"
  },
  {
    name: 'CustomerAccountEntry',
    fields: "customer_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'customers', key: 'id' } }, entry_type: { type: DataTypes.ENUM('sale', 'payment', 'adjustment'), allowNull: false }, reference: { type: DataTypes.STRING }, amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, balance_after: { type: DataTypes.DECIMAL(10, 2), allowNull: false }",
    associations: "CustomerAccountEntry.belongsTo(models.Customer, { foreignKey: 'customer_id' });"
  },
  {
    name: 'Supplier',
    fields: "vendor_code: { type: DataTypes.STRING, allowNull: false, unique: true }, company_name: { type: DataTypes.STRING, allowNull: false }, contact_person: { type: DataTypes.STRING }, phone: { type: DataTypes.STRING }, country: { type: DataTypes.STRING }, credit_terms: { type: DataTypes.STRING }, last_invoice_at: { type: DataTypes.DATE }, status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' }"
  },
  {
    name: 'SupplierAccountEntry',
    fields: "supplier_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'suppliers', key: 'id' } }, entry_type: { type: DataTypes.ENUM('purchase', 'payment', 'adjustment'), allowNull: false }, reference: { type: DataTypes.STRING }, amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, balance_after: { type: DataTypes.DECIMAL(10, 2), allowNull: false }",
    associations: "SupplierAccountEntry.belongsTo(models.Supplier, { foreignKey: 'supplier_id' });"
  },
  {
    name: 'SalesOrder',
    fields: "order_code: { type: DataTypes.STRING, allowNull: false, unique: true }, customer_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'customers', key: 'id' } }, order_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }, total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, order_status: { type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'), defaultValue: 'pending' }, payment_status: { type: DataTypes.ENUM('paid', 'credit', 'pending', 'refunded'), defaultValue: 'pending' }, created_by: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } }",
    associations: "SalesOrder.belongsTo(models.Customer, { foreignKey: 'customer_id' }); SalesOrder.belongsTo(models.User, { foreignKey: 'created_by' }); SalesOrder.hasMany(models.SaleLine, { foreignKey: 'sales_order_id' });"
  },
  {
    name: 'SaleLine',
    fields: "sales_order_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'sales_orders', key: 'id' } }, product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'products', key: 'id' } }, quantity: { type: DataTypes.INTEGER, allowNull: false }, unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, line_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false }",
    associations: "SaleLine.belongsTo(models.SalesOrder, { foreignKey: 'sales_order_id' }); SaleLine.belongsTo(models.Product, { foreignKey: 'product_id' });",
    timestamps: false
  },
  {
    name: 'PurchaseOrder',
    fields: "order_code: { type: DataTypes.STRING, allowNull: false, unique: true }, supplier_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'suppliers', key: 'id' } }, order_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }, total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, status: { type: DataTypes.ENUM('pending', 'received', 'cancelled'), defaultValue: 'pending' }, created_by: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } }",
    associations: "PurchaseOrder.belongsTo(models.Supplier, { foreignKey: 'supplier_id' }); PurchaseOrder.belongsTo(models.User, { foreignKey: 'created_by' }); PurchaseOrder.hasMany(models.PurchaseOrderLine, { foreignKey: 'purchase_order_id' });"
  },
  {
    name: 'PurchaseOrderLine',
    fields: "purchase_order_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'purchase_orders', key: 'id' } }, product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'products', key: 'id' } }, quantity: { type: DataTypes.INTEGER, allowNull: false }, unit_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, line_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false }",
    associations: "PurchaseOrderLine.belongsTo(models.PurchaseOrder, { foreignKey: 'purchase_order_id' }); PurchaseOrderLine.belongsTo(models.Product, { foreignKey: 'product_id' });",
    timestamps: false
  },
  {
    name: 'Employee',
    fields: "emp_code: { type: DataTypes.STRING, allowNull: false, unique: true }, full_name: { type: DataTypes.STRING, allowNull: false }, department: { type: DataTypes.STRING }, role_title: { type: DataTypes.STRING }, gross_salary: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' }"
  },
  {
    name: 'PayrollRun',
    fields: "period_month: { type: DataTypes.INTEGER, allowNull: false }, period_year: { type: DataTypes.INTEGER, allowNull: false }, status: { type: DataTypes.ENUM('pending', 'processed'), defaultValue: 'pending' }, processed_at: { type: DataTypes.DATE }",
    associations: "PayrollRun.hasMany(models.PayrollEntry, { foreignKey: 'payroll_run_id' });"
  },
  {
    name: 'PayrollEntry',
    fields: "payroll_run_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'payroll_runs', key: 'id' } }, employee_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'employees', key: 'id' } }, gross: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, deductions: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }, net_pay: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, pay_date: { type: DataTypes.DATE }, status: { type: DataTypes.ENUM('paid', 'pending'), defaultValue: 'pending' }",
    associations: "PayrollEntry.belongsTo(models.PayrollRun, { foreignKey: 'payroll_run_id' }); PayrollEntry.belongsTo(models.Employee, { foreignKey: 'employee_id' });",
    timestamps: false
  },
  {
    name: 'Expense',
    fields: "ref_code: { type: DataTypes.STRING, allowNull: false, unique: true }, description: { type: DataTypes.STRING, allowNull: false }, category: { type: DataTypes.STRING, allowNull: false }, amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, expense_date: { type: DataTypes.DATE, allowNull: false }, submitted_by: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } }, status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' }",
    associations: "Expense.belongsTo(models.User, { foreignKey: 'submitted_by' });"
  }
];

models.forEach(model => {
  const content = [
    "const { Model } = require('sequelize');",
    "module.exports = (sequelize, DataTypes) => {",
    "  class " + model.name + " extends Model {",
    "    static associate(models) {",
    "      " + (model.associations || "// define association here"),
    "    }",
    "  }",
    "  " + model.name + ".init({",
    "    " + model.fields,
    "  }, {",
    "    sequelize,",
    "    modelName: '" + model.name + "',",
    "    underscored: true,",
    model.timestamps === false ? "    timestamps: false," : "",
    "  });",
    "  return " + model.name + ";",
    "};"
  ].join('\n');
  fs.writeFileSync(path.join(__dirname, 'src', 'models', model.name.toLowerCase() + '.js'), content);
});

console.log("Models generated.");
