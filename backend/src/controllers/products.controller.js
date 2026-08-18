const db = require('../models');

exports.list = async (req, res, next) => {
  try {
    const products = await db.Product.findAll({
      include: [{ model: db.Category }]
    });

    const formatted = products.map((p) => {
      let status = p.status;
      if (p.quantity === 0) status = 'out-of-stock';
      else if (p.quantity <= p.reorder_point) status = 'low-stock';
      else status = 'in-stock';

      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.Category ? p.Category.name : 'General',
        qty: p.quantity,
        reorderPoint: p.reorder_point,
        cost: parseFloat(p.cost_price),
        price: parseFloat(p.sale_price),
        status
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const product = await db.Product.findByPk(req.params.id, {
      include: [{ model: db.Category }]
    });
    if (!product) return res.status(404).json({ success: false, error: { message: 'Product not found' } });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { sku, name, category_name, category_id, qty, quantity, reorderPoint, reorder_point, cost, cost_price, price, sale_price } = req.body;
    
    let targetCatId = category_id;
    if (!targetCatId) {
      let category = await db.Category.findOne({ where: { name: category_name || 'General' } });
      if (!category) {
        category = await db.Category.create({ name: category_name || 'General' });
      }
      targetCatId = category.id;
    }

    const finalQty = qty !== undefined ? Number(qty) : (quantity !== undefined ? Number(quantity) : 0);
    const finalReorder = reorderPoint !== undefined ? Number(reorderPoint) : (reorder_point !== undefined ? Number(reorder_point) : 10);
    const finalCost = cost !== undefined ? Number(cost) : (cost_price !== undefined ? Number(cost_price) : 0);
    const finalPrice = price !== undefined ? Number(price) : (sale_price !== undefined ? Number(sale_price) : 0);

    const product = await db.Product.create({
      sku: sku || `SKU-${Date.now()}`,
      name,
      category_id: targetCatId,
      quantity: finalQty,
      reorder_point: finalReorder,
      cost_price: finalCost,
      sale_price: finalPrice,
      status: finalQty === 0 ? 'out-of-stock' : (finalQty <= finalReorder ? 'low-stock' : 'in-stock')
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: { message: 'Product not found' } });

    await product.update(req.body);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: { message: 'Product not found' } });

    await product.destroy();
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
