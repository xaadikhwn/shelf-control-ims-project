const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    static associate(models) {
      Expense.belongsTo(models.User, { foreignKey: 'submitted_by' });
    }
  }
  Expense.init({
    ref_code: { type: DataTypes.STRING, allowNull: false, unique: true }, description: { type: DataTypes.STRING, allowNull: false }, category: { type: DataTypes.STRING, allowNull: false }, amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, expense_date: { type: DataTypes.DATE, allowNull: false }, submitted_by: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } }, status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' }
  }, {
    sequelize,
    modelName: 'Expense',
    tableName: 'Expenses',
    underscored: true,

  });
  return Expense;
};