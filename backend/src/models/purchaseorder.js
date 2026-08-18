const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PurchaseOrder extends Model {
    static associate(models) {
      PurchaseOrder.belongsTo(models.Supplier, { foreignKey: 'supplier_id' }); PurchaseOrder.belongsTo(models.User, { foreignKey: 'created_by' }); PurchaseOrder.hasMany(models.PurchaseOrderLine, { foreignKey: 'purchase_order_id' });
    }
  }
  PurchaseOrder.init({
    order_code: { type: DataTypes.STRING, allowNull: false, unique: true }, supplier_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Suppliers', key: 'id' } }, order_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }, total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, status: { type: DataTypes.ENUM('pending', 'received', 'cancelled'), defaultValue: 'pending' }, created_by: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } }
  }, {
    sequelize,
    modelName: 'PurchaseOrder',
    tableName: 'PurchaseOrders',
    underscored: true,

  });
  return PurchaseOrder;
};