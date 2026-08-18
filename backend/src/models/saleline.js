const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SaleLine extends Model {
    static associate(models) {
      SaleLine.belongsTo(models.SalesOrder, { foreignKey: 'sales_order_id' }); SaleLine.belongsTo(models.Product, { foreignKey: 'product_id' });
    }
  }
  SaleLine.init({
    sales_order_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'SalesOrders', key: 'id' } }, product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Products', key: 'id' } }, quantity: { type: DataTypes.INTEGER, allowNull: false }, unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, line_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  }, {
    sequelize,
    modelName: 'SaleLine',
    tableName: 'SaleLines',
    underscored: true,
    timestamps: false,
  });
  return SaleLine;
};