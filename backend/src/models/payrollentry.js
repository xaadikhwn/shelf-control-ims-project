const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PayrollEntry extends Model {
    static associate(models) {
      PayrollEntry.belongsTo(models.PayrollRun, { foreignKey: 'payroll_run_id' }); PayrollEntry.belongsTo(models.Employee, { foreignKey: 'employee_id' });
    }
  }
  PayrollEntry.init({
    payroll_run_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'PayrollRuns', key: 'id' } }, employee_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Employees', key: 'id' } }, gross: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, deductions: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }, net_pay: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, pay_date: { type: DataTypes.DATE }, status: { type: DataTypes.ENUM('paid', 'pending'), defaultValue: 'pending' }
  }, {
    sequelize,
    modelName: 'PayrollEntry',
    tableName: 'PayrollEntries',
    underscored: true,
    timestamps: false,
  });
  return PayrollEntry;
};