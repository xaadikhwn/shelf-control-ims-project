const db = require('../models');

// ── Adapter: DB row → frontend shape ──────────────────
function formatCustomer(c, outstanding = 0) {
  return {
    id: c.account_code || `CUST-${c.id}`,
    dbId: c.id,
    company: c.company_name,
    contact: c.contact_person || 'N/A',
    phone: c.phone || 'N/A',
    email: c.email || 'N/A',
    creditLimit: parseFloat(c.credit_limit) || 0,
    outstanding,
    lastOrder: c.last_order_at
      ? new Date(c.last_order_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'N/A',
    status: c.status || 'active',
    orders: [],
  };
}

exports.list = async (req, res, next) => {
  try {
    const page = parseInt(req.query?.page) || 1;
    const limit = parseInt(req.query?.limit) || 50;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.Customer.findAndCountAll({ limit, offset, order: [['id', 'ASC']] });

    const customers = [];
    for (const c of rows) {
      const lastEntry = await db.CustomerAccountEntry.findOne({
        where: { customer_id: c.id },
        order: [['id', 'DESC']],
      });
      const outstanding = lastEntry ? parseFloat(lastEntry.balance_after) : 0;
      customers.push(formatCustomer(c, outstanding));
    }

    res.status(200).json({ success: true, data: customers, meta: { page, limit, total: count } });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const paramId = req.params.id;
    let c = null;
    if (!isNaN(Number(paramId))) {
      c = await db.Customer.findByPk(Number(paramId));
    }
    if (!c) {
      c = await db.Customer.findOne({ where: { account_code: String(paramId) } });
    }

    if (!c) return res.status(404).json({ success: false, error: { message: 'Customer not found' } });

    const lastEntry = await db.CustomerAccountEntry.findOne({
      where: { customer_id: c.id },
      order: [['id', 'DESC']],
    });
    const outstanding = lastEntry ? parseFloat(lastEntry.balance_after) : 0;

    // Fetch last 10 sales orders
    const salesOrders = await db.SalesOrder.findAll({
      where: { customer_id: c.id },
      order: [['order_date', 'DESC']],
      limit: 10,
      include: [{ model: db.SaleLine }],
    });

    const orders = salesOrders.map((o) => ({
      id: o.order_code,
      date: new Date(o.order_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      items: o.SaleLines ? o.SaleLines.length : 0,
      total: parseFloat(o.total_amount),
      status: o.order_status,
      payment: o.payment_status,
    }));

    const formatted = formatCustomer(c, outstanding);
    formatted.orders = orders;

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const {
      account_code,
      accountCode,
      id,
      company_name,
      companyName,
      company,
      contact_person,
      contactPerson,
      contact,
      phone,
      email,
      credit_limit,
      creditLimit,
      status,
    } = req.body;

    const finalAccountCode = account_code || accountCode || id || `CUST-${Date.now()}`;
    const finalCompanyName = company_name || companyName || company;

    if (!finalCompanyName) {
      const err = new Error('Company name is required');
      err.statusCode = 400;
      return next(err);
    }

    const customer = await db.Customer.create({
      account_code: finalAccountCode,
      company_name: finalCompanyName,
      contact_person: contact_person || contactPerson || contact || null,
      phone: phone || null,
      email: email || null,
      credit_limit: parseFloat(credit_limit || creditLimit || 5000),
      status: status || 'active',
    });

    res.status(201).json({ success: true, data: formatCustomer(customer, 0) });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const paramId = req.params.id;
    let customer = null;
    if (!isNaN(Number(paramId))) {
      customer = await db.Customer.findByPk(Number(paramId));
    }
    if (!customer) {
      customer = await db.Customer.findOne({ where: { account_code: String(paramId) } });
    }
    if (!customer) return res.status(404).json({ success: false, error: { message: 'Customer not found' } });

    const {
      company,
      company_name,
      companyName,
      contact,
      contact_person,
      contactPerson,
      creditLimit,
      credit_limit,
      phone,
      email,
      status,
    } = req.body;

    const updates = {
      company_name: company_name || companyName || company || customer.company_name,
      contact_person: contact_person || contactPerson || contact || customer.contact_person,
      phone: phone !== undefined ? phone : customer.phone,
      email: email !== undefined ? email : customer.email,
      credit_limit: credit_limit !== undefined ? parseFloat(credit_limit) : creditLimit !== undefined ? parseFloat(creditLimit) : customer.credit_limit,
      status: status || customer.status,
    };

    await customer.update(updates);

    const lastEntry = await db.CustomerAccountEntry.findOne({
      where: { customer_id: customer.id },
      order: [['id', 'DESC']],
    });
    const outstanding = lastEntry ? parseFloat(lastEntry.balance_after) : 0;

    res.status(200).json({ success: true, data: formatCustomer(customer, outstanding) });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const paramId = req.params.id;
    let customer = null;
    if (!isNaN(Number(paramId))) {
      customer = await db.Customer.findByPk(Number(paramId));
    }
    if (!customer) {
      customer = await db.Customer.findOne({ where: { account_code: String(paramId) } });
    }
    if (!customer) return res.status(404).json({ success: false, error: { message: 'Customer not found' } });

    await customer.destroy();
    res.status(200).json({ success: true, data: { message: 'Customer deleted successfully' } });
  } catch (error) {
    next(error);
  }
};

exports.recordPayment = async (req, res, next) => {
  const t = await db.sequelize.transaction();
  try {
    const { amount } = req.body;
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      const err = new Error('Invalid payment amount');
      err.statusCode = 400;
      throw err;
    }
    const customer_id = req.params.id;
    const isMysql = db.sequelize.getDialect() === 'mysql';
    const lockOption = isMysql ? t.LOCK.UPDATE : undefined;

    let customerByCode = null;
    if (!isNaN(Number(customer_id))) {
      customerByCode = await db.Customer.findByPk(Number(customer_id), { transaction: t, lock: lockOption });
    }
    if (!customerByCode) {
      customerByCode = await db.Customer.findOne({
        where: { account_code: String(customer_id) },
        transaction: t,
        lock: lockOption,
      });
    }

    if (!customerByCode) {
      const err = new Error('Customer not found');
      err.statusCode = 404;
      throw err;
    }

    const lastEntry = await db.CustomerAccountEntry.findOne({
      where: { customer_id: customerByCode.id },
      order: [['id', 'DESC']],
      transaction: t,
    });
    const currentBalance = lastEntry ? parseFloat(lastEntry.balance_after) : 0;
    const newBalance = Math.max(0, currentBalance - parseFloat(amount));

    await db.CustomerAccountEntry.create(
      {
        customer_id: customerByCode.id,
        entry_type: 'payment',
        reference: `PMT-${Date.now()}`,
        amount: parseFloat(amount),
        balance_after: newBalance,
      },
      { transaction: t }
    );

    // Update status based on new balance vs credit limit
    const utilisation = customerByCode.credit_limit > 0 ? (newBalance / parseFloat(customerByCode.credit_limit)) * 100 : 0;
    if (newBalance <= 0) customerByCode.status = 'active';
    else if (utilisation > 90) customerByCode.status = 'overdue';
    else if (utilisation > 70) customerByCode.status = 'warning';
    else customerByCode.status = 'active';
    await customerByCode.save({ transaction: t });

    await t.commit();
    res.status(200).json({
      success: true,
      data: {
        newBalance,
        status: customerByCode.status,
        entry: { amount: parseFloat(amount), balance_after: newBalance },
      },
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
