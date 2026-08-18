const db = require('../models');

exports.list = async (req, res, next) => {
  try {
    const expenses = await db.Expense.findAll({
      include: [{ model: db.User, attributes: ['full_name'] }]
    });

    const formatted = expenses.map((exp) => ({
      ref: exp.ref_code || `EXP-00${exp.id}`,
      id: exp.id,
      description: exp.description,
      category: exp.category,
      amount: parseFloat(exp.amount),
      date: new Date(exp.expense_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      submittedBy: exp.User ? exp.User.full_name : 'System User',
      status: exp.status
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { description, category, amount, date } = req.body;
    const count = await db.Expense.count();
    const ref_code = `EXP-${String(count + 1).padStart(3, '0')}`;

    const expense = await db.Expense.create({
      ref_code,
      description,
      category,
      amount,
      expense_date: date ? new Date(date) : new Date(),
      submitted_by: req.user.id,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const expense = await db.Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ success: false, error: { message: 'Expense not found' } });

    expense.status = status;
    await expense.save();
    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { description, category, amount, date, status } = req.body;
    const expense = await db.Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ success: false, error: { message: 'Expense not found' } });

    if (description !== undefined) expense.description = description;
    if (category !== undefined) expense.category = category;
    if (amount !== undefined) expense.amount = amount;
    if (date !== undefined) expense.expense_date = new Date(date);
    if (status !== undefined) expense.status = status;

    await expense.save();
    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const expense = await db.Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ success: false, error: { message: 'Expense not found' } });

    await expense.destroy();
    res.status(200).json({ success: true, data: { message: 'Expense deleted successfully' } });
  } catch (error) {
    next(error);
  }
};
