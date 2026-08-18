const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/models');
const { generateAccessToken } = require('../../src/utils/tokens');

let user, customer, product, token;

describe('Sales & Customers Integration', () => {
  beforeAll(async () => {
    // Setup initial test data
    const role = await db.Role.create({ name: 'Administrator' });
    user = await db.User.create({
      full_name: 'Test Admin',
      email: 'testadmin@bizmanage.com',
      password_hash: 'hashedpassword',
      role_id: role.id
    });
    user.Role = role;
    token = generateAccessToken(user);

    customer = await db.Customer.create({
      account_code: 'CUST-TEST',
      company_name: 'Test Company',
      credit_limit: 1000
    });

    const category = await db.Category.create({ name: 'Test Cat' });

    product = await db.Product.create({
      sku: 'SKU-001',
      name: 'Test Product',
      category_id: category.id,
      quantity: 50,
      reorder_point: 10,
      cost_price: 10,
      sale_price: 20
    });
  });

  it('should create a credit sale and update stock, status, and ledger atomically', async () => {
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customer_id: customer.id,
        payment_status: 'credit',
        items: [
          { product_id: product.id, quantity: 45 }
        ]
      });

    expect(res.status).toBe(201);
    
    // Check product stock decremented and status changed
    const updatedProduct = await db.Product.findByPk(product.id);
    expect(updatedProduct.quantity).toBe(5); // 50 - 45
    expect(updatedProduct.status).toBe('low-stock');
    
    // Check stock alert created
    const alert = await db.StockAlert.findOne({ where: { product_id: product.id } });
    expect(alert).toBeTruthy();
    expect(alert.quantity_at_trigger).toBe(5);
    
    // Check customer ledger updated correctly
    const lastEntry = await db.CustomerAccountEntry.findOne({ where: { customer_id: customer.id }, order: [['id', 'DESC']] });
    expect(lastEntry).toBeTruthy();
    expect(parseFloat(lastEntry.amount)).toBe(900); // 45 * 20
    expect(parseFloat(lastEntry.balance_after)).toBe(900);
  });

  it('should update customer credit account balance correctly after a partial payment', async () => {
    const res = await request(app)
      .post(`/api/customers/${customer.id}/payments`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 400
      });

    expect(res.status).toBe(200);

    const lastEntry = await db.CustomerAccountEntry.findOne({ where: { customer_id: customer.id }, order: [['id', 'DESC']] });
    expect(lastEntry).toBeTruthy();
    expect(parseFloat(lastEntry.amount)).toBe(400);
    expect(parseFloat(lastEntry.balance_after)).toBe(500); // 900 - 400
  });

  it('should reject access with invalid token', async () => {
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer invalidtoken`)
      .send({});
    expect(res.status).toBe(401);
  });
});
