const db = require('../models');

exports.list = async (req, res, next) => {
  try {
    const employees = await db.Employee.findAll();

    const formatted = employees.map((e) => {
      const gross = parseFloat(e.gross_salary || 0);
      const deductions = Math.round(gross * 0.20 * 100) / 100;
      const netPay = gross - deductions;

      return {
        id: e.emp_code || `EMP-00${e.id}`,
        dbId: e.id,
        name: e.full_name,
        department: e.department || 'Operations',
        role: e.role_title || 'Staff',
        gross,
        deductions,
        netPay,
        payDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: e.status === 'active' ? 'paid' : 'pending'
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, full_name, department, role, role_title, gross, gross_salary, emp_code } = req.body;
    const finalFullName = full_name || name;
    const finalEmpCode = emp_code || `EMP-${Date.now()}`;
    const finalGross = gross !== undefined ? Number(gross) : (gross_salary !== undefined ? Number(gross_salary) : 0);

    const employee = await db.Employee.create({
      emp_code: finalEmpCode,
      full_name: finalFullName,
      department: department || 'Operations',
      role_title: role_title || role || 'Staff',
      gross_salary: finalGross,
      status: 'active'
    });
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

exports.runPayroll = async (req, res, next) => {
  try {
    const employees = await db.Employee.findAll({ where: { status: 'active' } });
    res.status(200).json({
      success: true,
      message: 'Payroll processed successfully',
      processedCount: employees.length
    });
  } catch (error) {
    next(error);
  }
};
