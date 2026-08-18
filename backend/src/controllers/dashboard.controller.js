const db = require('../models');

exports.getSummary = async (req, res, next) => {
  try {
    const totalSales = await db.SalesOrder.sum('total_amount') || 0;
    const totalCustomers = await db.Customer.count();
    
    const products = await db.Product.findAll();
    let stockAlerts = 0;
    let outOfStock = 0;

    products.forEach((p) => {
      if (p.quantity === 0) outOfStock++;
      else if (p.quantity <= p.reorder_point) stockAlerts++;
    });

    const employees = await db.Employee.findAll();
    const monthlyPayroll = employees.reduce((sum, e) => sum + parseFloat(e.gross_salary || 0), 0);

    const summary = {
      totalRevenue: Math.round(parseFloat(totalSales)),
      revenueTrend: '+12.5% vs last month',
      outstandingCredit: 45000,
      creditAccounts: totalCustomers,
      overdueAccounts: 1,
      stockAlerts,
      outOfStock,
      monthlyPayroll: Math.round(monthlyPayroll),
      payrollEmployees: employees.length,
      payrollProcessed: `${employees.length}/${employees.length}`,
      revenueByMonth: [
        { month: 'Jan', revenue: 42000, expenses: 28000 },
        { month: 'Feb', revenue: 48000, expenses: 31000 },
        { month: 'Mar', revenue: 55000, expenses: 35000 },
        { month: 'Apr', revenue: 51000, expenses: 33000 },
        { month: 'May', revenue: 62000, expenses: 38000 },
        { month: 'Jun', revenue: 58000, expenses: 36000 },
        { month: 'Jul', revenue: 65000, expenses: 40000 },
        { month: 'Aug', revenue: 70000, expenses: 42000 },
        { month: 'Sep', revenue: 68000, expenses: 41000 },
        { month: 'Oct', revenue: 75000, expenses: 45000 },
        { month: 'Nov', revenue: 82000, expenses: 48000 },
        { month: 'Dec', revenue: Math.round(parseFloat(totalSales) || 91700), expenses: 52000 },
      ],
      salesByCategory: [
        { category: 'Textiles', percentage: 45, color: '#3b82f6' },
        { category: 'Accessories', percentage: 25, color: '#22c55e' },
        { category: 'Equipment', percentage: 18, color: '#f59e0b' },
        { category: 'Supplies', percentage: 12, color: '#8b5cf6' },
      ],
    };

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};
