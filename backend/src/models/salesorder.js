const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SalesOrder extends Model {
    static associate(models) {
      SalesOrder.belongsTo(models.Customer, { foreignKey: 'customer_id' }); SalesOrder.belongsTo(models.User, { foreignKey: 'created_by' }); SalesOrder.hasMany(models.SaleLine, { foreignKey: 'sales_order_id' });
    }
  }
  SalesOrder.init({
    order_code: { type: DataTypes.STRING, allowNull: false, unique: true }, customer_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Customers', key: 'id' } }, order_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }, total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, order_status: { type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'), defaultValue: 'pending' }, payment_status: { type: DataTypes.ENUM('paid', 'credit', 'pending', 'refunded'), defaultValue: 'pending' }, created_by: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } }
  }, {
    sequelize,
    modelName: 'SalesOrder',
    tableName: 'SalesOrders',
    underscored: true,

  });
  return SalesOrder;
};