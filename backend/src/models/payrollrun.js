const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PayrollRun extends Model {
    static associate(models) {
      PayrollRun.hasMany(models.PayrollEntry, { foreignKey: 'payroll_run_id' });
    }
  }
  PayrollRun.init({
    period_month: { type: DataTypes.INTEGER, allowNull: false }, period_year: { type: DataTypes.INTEGER, allowNull: false }, status: { type: DataTypes.ENUM('pending', 'processed'), defaultValue: 'pending' }, processed_at: { type: DataTypes.DATE }
  }, {
    sequelize,
    modelName: 'PayrollRun',
    tableName: 'PayrollRuns',
    underscored: true,

  });
  return PayrollRun;
};