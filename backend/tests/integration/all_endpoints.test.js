const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/models');
const { generateAccessToken } = require('../../src/utils/tokens');

let adminUser, adminToken, testProduct, testCustomer, testSupplier, testExpense, testEmployee;

describe('Complete API Endpoint Diagnostic & Hardening Suite', () => {
  beforeAll(async () => {
    // 1. Roles
    const [adminRole] = await db.Role.findOrCreate({ where: { name: 'Administrator' }, defaults: { description: 'Admin' } });
    await db.Role.findOrCreate({ where: { name: 'Manager' }, defaults: { description: 'Manager' } });
    await db.Role.findOrCreate({ where: { name: 'User' }, defaults: { description: 'User' } });

    // 2. Admin User
    adminUser = await db.User.create({
      full_name: 'Test Endpoint Admin',
      email: `test_endpoint_admin_${Date.now()}@bizmanage.com`,
      password_hash: 'hashedpass',
      role_id: adminRole.id,
      is_active: true
    });
    adminUser.Role = adminRole;
    adminToken = generateAccessToken(adminUser);

    // 3. Category & Product
    const category = await db.Category.create({ name: 'Test Category' });
    testProduct = await db.Product.create({
      sku: `SKU-EP-${Date.now()}`,
      name: 'Diagnostic Product',
      category_id: category.id,
      quantity: 100,
      reorder_point: 20,
      cost_price: 15.00,
      sale_price: 25.00,
      status: 'in-stock'
    });

    // 4. Customer
    testCustomer = await db.Customer.create({
      account_code: `CUST-EP-${Date.now()}`,
      company_name: 'Diagnostic Customer Inc',
      credit_limit: 5000,
      status: 'active'
    });

    // 5. Supplier
    testSupplier = await db.Supplier.create({
      vendor_code: `VND-EP-${Date.now()}`,
      company_name: 'Diagnostic Supplier Ltd',
      status: 'active'
    });

    // 6. Expense
    testExpense = await db.Expense.create({
      ref_code: `EXP-EP-${Date.now()}`,
      description: 'Diagnostic Expense',
      category: 'Office',
      amount: 150.00,
      expense_date: new Date(),
      submitted_by: adminUser.id,
      status: 'pending'
    });

    // 7. Employee
    testEmployee = await db.Employee.create({
      emp_code: `EMP-EP-${Date.now()}`,
      full_name: 'Diagnostic Employee',
      department: 'Finance',
      role_title: 'Accountant',
      gross_salary: 3000.00,
      status: 'active'
    });
  });

  // --- HEALTH CHECK ---
  it('GET /health - should return API status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // --- AUTH ENDPOINTS ---
  it('POST /api/auth/register - should create user and return access token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        full_name: 'New Registered User',
        email: `new_user_${Date.now()}@bizmanage.com`,
        password: 'Password123!',
        role: 'User'
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeTruthy();
  });

  it('POST /api/auth/login - should authenticate valid user', async () => {
    const email = `login_user_${Date.now()}@bizmanage.com`;
    await request(app).post('/api/auth/register').send({
      full_name: 'Login User',
      email,
      password: 'Password123!',
      role: 'User'
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeTruthy();
  });

  it('GET /api/auth/me - should return current authenticated user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(adminUser.id);
  });

  it('POST /api/auth/forgot-password & reset-password', async () => {
    const res1 = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: adminUser.email });
    expect(res1.status).toBe(200);

    // In non-production environments the real reset token is returned so the
    // flow can be exercised end-to-end without a configured email provider.
    const realToken = res1.body.devResetToken;
    expect(realToken).toBeTruthy();

    // A bogus token must be rejected — this is the behaviour that replaced
    // the old always-succeeds stub.
    const badRes = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'dummy_token', new_password: 'NewPassword123!' });
    expect(badRes.status).toBe(400);

    const res2 = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: realToken, new_password: 'NewPassword123!' });
    expect(res2.status).toBe(200);

    // Restore the admin's original password so later tests in this suite
    // (and re-runs) that log in as adminUser are unaffected.
    const bcrypt = require('bcryptjs');
    const freshHash = await bcrypt.hash('admin123', 12);
    await db.User.update({ password_hash: freshHash }, { where: { id: adminUser.id } });
  });

  // --- DASHBOARD ---
  it('GET /api/dashboard/summary - should return summary stats', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalRevenue');
  });

  // --- CUSTOMERS ---
  it('GET /api/customers & GET /api/customers/:id', async () => {
    const resList = await request(app)
      .get('/api/customers')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resList.status).toBe(200);
    expect(Array.isArray(resList.body.data)).toBe(true);

    const resById = await request(app)
      .get(`/api/customers/${testCustomer.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resById.status).toBe(200);
    expect(resById.body.data.dbId).toBe(testCustomer.id);
  });

  it('POST /api/customers/:id/payments - should record customer payment', async () => {
    const res = await request(app)
      .post(`/api/customers/${testCustomer.id}/payments`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 100, reference_notes: 'Payment test' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // --- PRODUCTS ---
  it('GET /api/products, POST /api/products, PUT /api/products/:id, DELETE /api/products/:id', async () => {
    // 1. List
    const resList = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resList.status).toBe(200);

    // 2. Create
    const resCreate = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sku: `SKU-NEW-${Date.now()}`,
        name: 'New Product Test',
        category_id: 1,
        quantity: 50,
        reorder_point: 10,
        cost_price: 10,
        sale_price: 20
      });
    expect(resCreate.status).toBe(201);
    const newProdId = resCreate.body.data.id;

    // 3. Update
    const resUpdate = await request(app)
      .put(`/api/products/${newProdId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Product Name' });
    expect(resUpdate.status).toBe(200);
    expect(resUpdate.body.data.name).toBe('Updated Product Name');

    // 4. Delete
    const resDelete = await request(app)
      .delete(`/api/products/${newProdId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resDelete.status).toBe(200);
  });

  // --- SALES ---
  it('GET /api/sales & POST /api/sales', async () => {
    const resList = await request(app)
      .get('/api/sales')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resList.status).toBe(200);

    const resCreate = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customer_id: testCustomer.id,
        payment_status: 'paid',
        payment_method: 'cash',
        items: [
          { product_id: testProduct.id, quantity: 2 }
        ]
      });
    expect(resCreate.status).toBe(201);
    expect(resCreate.body.success).toBe(true);
  });

  // --- SUPPLIERS ---
  it('GET /api/suppliers, POST /api/suppliers, PUT /api/suppliers/:id', async () => {
    const resList = await request(app)
      .get('/api/suppliers')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resList.status).toBe(200);

    const resCreate = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        vendor_code: `VND-NEW-${Date.now()}`,
        company_name: 'New Test Supplier',
        contact_person: 'Supplier Contact',
        phone: '123456789'
      });
    expect(resCreate.status).toBe(201);

    const supplierId = resCreate.body.data.id;
    const resUpdate = await request(app)
      .put(`/api/suppliers/${supplierId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ company_name: 'Updated Supplier Name' });
    expect(resUpdate.status).toBe(200);
  });

  // --- EXPENSES ---
  it('GET /api/expenses, POST /api/expenses, PATCH /api/expenses/:id/status', async () => {
    const resList = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resList.status).toBe(200);

    const resCreate = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        description: 'New Office Expense',
        category: 'Supplies',
        amount: 85.50
      });
    expect(resCreate.status).toBe(201);

    const expenseId = resCreate.body.data.id;
    const resStatus = await request(app)
      .patch(`/api/expenses/${expenseId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved' });
    expect(resStatus.status).toBe(200);
  });

  // --- PAYROLL ---
  it('GET /api/payroll, POST /api/payroll, POST /api/payroll/run', async () => {
    const resList = await request(app)
      .get('/api/payroll')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resList.status).toBe(200);

    const resCreate = await request(app)
      .post('/api/payroll')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        full_name: 'New Payroll Employee',
        gross_salary: 3200.00,
        department: 'Operations',
        role_title: 'Manager'
      });
    expect(resCreate.status).toBe(201);

    const resRun = await request(app)
      .post('/api/payroll/run')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resRun.status).toBe(200);
    expect(resRun.body.success).toBe(true);
  });

  // --- USERS ---
  it('GET /api/users & PATCH /api/users/:id/role', async () => {
    const resList = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resList.status).toBe(200);

    const targetUser = resList.body.data[0];
    const resRole = await request(app)
      .patch(`/api/users/${targetUser.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role_id: 2 });
    expect(resRole.status).toBe(200);
  });
});
