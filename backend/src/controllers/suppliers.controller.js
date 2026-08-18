const db = require('../models');

async function getPayable(supplierId, transaction) {
  const lastEntry = await db.SupplierAccountEntry.findOne({
    where: { supplier_id: supplierId },
    order: [['id', 'DESC']],
    transaction,
  });
  return lastEntry ? parseFloat(lastEntry.balance_after) : 0;
}

exports.list = async (req, res, next) => {
  try {
    const suppliers = await db.Supplier.findAll();

    const formatted = await Promise.all(
      suppliers.map(async (s) => ({
        id: s.vendor_code || `VND-${s.id}`,
        dbId: s.id,
        company: s.company_name,
        contact: s.contact_person || 'N/A',
        phone: s.phone || 'N/A',
        country: s.country || 'International',
        payable: await getPayable(s.id),
        creditTerms: s.credit_terms || 'Net 30',
        lastInvoice: s.last_invoice_at ? new Date(s.last_invoice_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
        status: s.status || 'active'
      }))
    );

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const {
      vendor_code,
      vendorCode,
      id,
      company_name,
      companyName,
      company,
      contact_person,
      contactPerson,
      contact,
      phone,
      country,
      credit_terms,
      creditTerms,
      status
    } = req.body;

    const finalVendorCode = vendor_code || vendorCode || id || `VND-${Date.now()}`;
    const finalCompanyName = company_name || companyName || company;

    if (!finalCompanyName) {
      const err = new Error('Company name is required');
      err.statusCode = 400;
      return next(err);
    }

    const supplier = await db.Supplier.create({
      vendor_code: finalVendorCode,
      company_name: finalCompanyName,
      contact_person: contact_person || contactPerson || contact || null,
      phone: phone || null,
      country: country || 'United Kingdom',
      credit_terms: credit_terms || creditTerms || 'Net 30',
      status: status || 'active'
    });

    const formatted = {
      id: supplier.vendor_code,
      dbId: supplier.id,
      company: supplier.company_name,
      contact: supplier.contact_person || 'N/A',
      phone: supplier.phone || 'N/A',
      country: supplier.country || 'International',
      payable: 0,
      creditTerms: supplier.credit_terms || 'Net 30',
      lastInvoice: 'N/A',
      status: supplier.status || 'active'
    };

    res.status(201).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const paramId = req.params.id;
    let supplier = null;
    if (!isNaN(Number(paramId))) {
      supplier = await db.Supplier.findByPk(Number(paramId));
    }
    if (!supplier) {
      supplier = await db.Supplier.findOne({ where: { vendor_code: String(paramId) } });
    }
    if (!supplier) return res.status(404).json({ success: false, error: { message: 'Supplier not found' } });

    const { company, company_name, companyName, contact, contact_person, contactPerson, creditTerms, credit_terms, phone, country, ...rest } = req.body;

    const updates = {
      ...rest,
      company_name: company_name || companyName || company || supplier.company_name,
      contact_person: contact_person || contactPerson || contact || supplier.contact_person,
      credit_terms: credit_terms || creditTerms || supplier.credit_terms,
      phone: phone !== undefined ? phone : supplier.phone,
      country: country !== undefined ? country : supplier.country
    };

    await supplier.update(updates);
    const payable = await getPayable(supplier.id);
    res.status(200).json({
      success: true,
      data: {
        id: supplier.vendor_code,
        dbId: supplier.id,
        company: supplier.company_name,
        contact: supplier.contact_person || 'N/A',
        phone: supplier.phone || 'N/A',
        country: supplier.country || 'International',
        payable,
        creditTerms: supplier.credit_terms || 'Net 30',
        status: supplier.status || 'active',
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const paramId = req.params.id;
    let supplier = null;
    if (!isNaN(Number(paramId))) {
      supplier = await db.Supplier.findByPk(Number(paramId));
    }
    if (!supplier) {
      supplier = await db.Supplier.findOne({ where: { vendor_code: String(paramId) } });
    }
    if (!supplier) return res.status(404).json({ success: false, error: { message: 'Supplier not found' } });

    await supplier.destroy();
    res.status(200).json({ success: true, data: { message: 'Supplier deleted successfully' } });
  } catch (error) {
    next(error);
  }
};

// Records a purchase (invoice received) against a supplier, increasing the
// payable balance. This is the supplier-side equivalent of a credit sale on
// the customer ledger — without it, "payable" can never be anything but zero.
exports.recordPurchase = async (req, res, next) => {
  const t = await db.sequelize.transaction();
  try {
    const { amount, reference } = req.body;
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      const err = new Error('Invalid purchase amount');
      err.statusCode = 400;
      throw err;
    }

    const paramId = req.params.id;
    const supplier = !isNaN(Number(paramId))
      ? await db.Supplier.findByPk(Number(paramId), { transaction: t, lock: t.LOCK.UPDATE })
      : await db.Supplier.findOne({ where: { vendor_code: String(paramId) }, transaction: t, lock: t.LOCK.UPDATE });

    if (!supplier) {
      const err = new Error('Supplier not found');
      err.statusCode = 404;
      throw err;
    }

    const currentBalance = await getPayable(supplier.id, t);
    const newBalance = currentBalance + parseFloat(amount);

    await db.SupplierAccountEntry.create(
      {
        supplier_id: supplier.id,
        entry_type: 'purchase',
        reference: reference || `INV-${Date.now()}`,
        amount: parseFloat(amount),
        balance_after: newBalance,
      },
      { transaction: t }
    );

    supplier.last_invoice_at = new Date();
    await supplier.save({ transaction: t });

    await t.commit();
    res.status(200).json({ success: true, data: { newBalance, entry: { amount: parseFloat(amount), balance_after: newBalance } } });
  } catch (error) {
    await t.rollback();
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

    const paramId = req.params.id;
    const supplier = !isNaN(Number(paramId))
      ? await db.Supplier.findByPk(Number(paramId), { transaction: t, lock: t.LOCK.UPDATE })
      : await db.Supplier.findOne({ where: { vendor_code: String(paramId) }, transaction: t, lock: t.LOCK.UPDATE });

    if (!supplier) {
      const err = new Error('Supplier not found');
      err.statusCode = 404;
      throw err;
    }

    const currentBalance = await getPayable(supplier.id, t);
    const newBalance = Math.max(0, currentBalance - parseFloat(amount));

    await db.SupplierAccountEntry.create(
      {
        supplier_id: supplier.id,
        entry_type: 'payment',
        reference: `PMT-${Date.now()}`,
        amount: parseFloat(amount),
        balance_after: newBalance,
      },
      { transaction: t }
    );

    supplier.status = newBalance <= 0 ? 'active' : supplier.status;
    await supplier.save({ transaction: t });

    await t.commit();
    res.status(200).json({
      success: true,
      data: { newBalance, status: supplier.status, entry: { amount: parseFloat(amount), balance_after: newBalance } },
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
