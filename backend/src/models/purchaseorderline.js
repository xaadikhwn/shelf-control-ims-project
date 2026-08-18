const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PurchaseOrderLine extends Model {
    static associate(models) {
      PurchaseOrderLine.belongsTo(models.PurchaseOrder, { foreignKey: 'purchase_order_id' }); PurchaseOrderLine.belongsTo(models.Product, { foreignKey: 'product_id' });
    }
  }
  PurchaseOrderLine.init({
    purchase_order_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'PurchaseOrders', key: 'id' } }, product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Products', key: 'id' } }, quantity: { type: DataTypes.INTEGER, allowNull: false }, unit_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, line_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  }, {
    sequelize,
    modelName: 'PurchaseOrderLine',
    tableName: 'PurchaseOrderLines',
    underscored: true,
    timestamps: false,
  });
  return PurchaseOrderLine;
};