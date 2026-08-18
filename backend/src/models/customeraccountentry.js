const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerAccountEntry extends Model {
    static associate(models) {
      CustomerAccountEntry.belongsTo(models.Customer, { foreignKey: 'customer_id' });
    }
  }
  CustomerAccountEntry.init({
    customer_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Customers', key: 'id' } }, entry_type: { type: DataTypes.ENUM('sale', 'payment', 'adjustment'), allowNull: false }, reference: { type: DataTypes.STRING }, amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, balance_after: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  }, {
    sequelize,
    modelName: 'CustomerAccountEntry',
    tableName: 'CustomerAccountEntries',
    underscored: true,

  });
  return CustomerAccountEntry;
};