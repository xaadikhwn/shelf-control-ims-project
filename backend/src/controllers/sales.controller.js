const db = require('../models');

// ── Adapter: Sequelize SalesOrder row → frontend shape ─
function formatOrder(o) {
  const customerName = o.Customer
    ? o.Customer.company_name
    : o.customer_id
    ? `Customer #${o.customer_id}`
    : 'Unknown';

  const lineCount = o.SaleLines ? o.SaleLines.length : 0;

  return {
    id: o.order_code || `SO-${o.id}`,
    dbId: o.id,
    customerId: String(o.customer_id),
    customer: customerName,
    date: o.order_date
      ? new Date(o.order_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'N/A',
    items: lineCount,
    total: parseFloat(o.total_amount) || 0,
    orderStatus: o.order_status || 'pending',
    payment: o.payment_status || 'pending',
  };
}

exports.list = async (req, res, next) => {
  try {
    const page = parseInt(req.query?.page) || 1;
    const limit = parseInt(req.query?.limit) || 50;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.SalesOrder.findAndCountAll({
      limit,
      offset,
      order: [['order_date', 'DESC']],
      include: [
        { model: db.Customer, attributes: ['id', 'company_name'] },
        { model: db.SaleLine },
      ],
    });

    res.status(200).json({
      success: true,
      data: rows.map(formatOrder),
      meta: { page, limit, total: count },
    });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const order = await db.SalesOrder.findByPk(req.params.id, {
      include: [
        { model: db.Customer },
        { model: db.SaleLine, include: [{ model: db.Product }] },
      ],
    });
    if (!order) {
      const err = new Error('Sales order not found');
      err.statusCode = 404;
      return next(err);
    }
    res.status(200).json({ success: true, data: formatOrder(order) });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  const t = await db.sequelize.transaction();
  try {
    const { customer_id, payment_status, items } = req.body;

    if (!items || !items.length) {
      const err = new Error('At least one item is required');
      err.statusCode = 400;
      throw err;
    }

    // Resolve customer by PK or account_code
    let targetCustomer = null;
    if (typeof customer_id === 'number' || !isNaN(Number(customer_id))) {
      targetCustomer = await db.Customer.findByPk(Number(customer_id), { transaction: t });
    }
    if (!targetCustomer && customer_id) {
      targetCustomer = await db.Customer.findOne({ where: { account_code: String(customer_id) }, transaction: t });
    }
    if (!targetCustomer) {
      targetCustomer = await db.Customer.findOne({ transaction: t });
    }

    const resolvedCustomerId = targetCustomer ? targetCustomer.id : 1;

    let total_amount = 0;
    const lineItemsToCreate = [];

    const isMysql = db.sequelize.getDialect() === 'mysql';
    const lockOption = isMysql ? t.LOCK.UPDATE : undefined;

    for (const item of items) {
      const product = await db.Product.findByPk(item.product_id, { transaction: t, lock: lockOption });
      if (!product) throw Object.assign(new Error(`Product ${item.product_id} not found`), { statusCode: 404 });
      if (product.quantity < item.quantity)
        throw Object.assign(new Error(`Insufficient stock for "${product.name}". Available: ${product.quantity}`), { statusCode: 422 });

      const line_total = parseFloat(product.sale_price) * item.quantity;
      total_amount += line_total;

      lineItemsToCreate.push({ product_id: product.id, quantity: item.quantity, unit_price: product.sale_price, line_total });

      product.quantity -= item.quantity;
      if (product.quantity <= 0) product.status = 'out-of-stock';
      else if (product.quantity <= product.reorder_point) product.status = 'low-stock';
      else product.status = 'in-stock';

      if (product.status !== 'in-stock') {
        const existingAlert = await db.StockAlert.findOne({ where: { product_id: product.id, resolved_at: null }, transaction: t });
        if (!existingAlert) {
          await db.StockAlert.create(
            { product_id: product.id, quantity_at_trigger: product.quantity, threshold_at_trigger: product.reorder_point, triggered_at: new Date() },
            { transaction: t }
          );
        }
      }
      await product.save({ transaction: t });
    }

    const order_code = `SO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;

    const salesOrder = await db.SalesOrder.create(
      { order_code, customer_id: resolvedCustomerId, order_date: new Date(), total_amount, order_status: 'completed', payment_status: payment_status || 'paid', created_by: req.user?.id || 1 },
      { transaction: t }
    );

    for (const lineItem of lineItemsToCreate) {
      await db.SaleLine.create({ ...lineItem, sales_order_id: salesOrder.id }, { transaction: t });
    }

    // Credit sale → update customer ledger
    if (payment_status === 'credit' && targetCustomer) {
      const lastEntry = await db.CustomerAccountEntry.findOne({
        where: { customer_id: targetCustomer.id },
        order: [['id', 'DESC']],
        transaction: t,
      });
      const currentBalance = lastEntry ? parseFloat(lastEntry.balance_after) : 0;
      const newBalance = currentBalance + total_amount;

      await db.CustomerAccountEntry.create(
        { customer_id: targetCustomer.id, entry_type: 'sale', reference: order_code, amount: total_amount, balance_after: newBalance },
        { transaction: t }
      );

      const utilisation = parseFloat(targetCustomer.credit_limit) > 0 ? (newBalance / parseFloat(targetCustomer.credit_limit)) * 100 : 0;
      if (utilisation > 90) targetCustomer.status = 'overdue';
      else if (utilisation > 70) targetCustomer.status = 'warning';
      await targetCustomer.save({ transaction: t });
    }

    await t.commit();

    // Return the fully formatted order
    const created = await db.SalesOrder.findByPk(salesOrder.id, {
      include: [{ model: db.Customer, attributes: ['id', 'company_name'] }, { model: db.SaleLine }],
    });
    res.status(201).json({ success: true, data: formatOrder(created) });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await db.SalesOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: { message: 'Order not found' } });
    order.order_status = status;
    await order.save();
    res.status(200).json({ success: true, data: formatOrder(order) });
  } catch (error) {
    next(error);
  }
};
