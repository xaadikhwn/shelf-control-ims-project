const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StockAlert extends Model {
    static associate(models) {
      StockAlert.belongsTo(models.Product, { foreignKey: 'product_id' });
    }
  }
  StockAlert.init({
    product_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Products', key: 'id' } }, triggered_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }, quantity_at_trigger: { type: DataTypes.INTEGER, allowNull: false }, threshold_at_trigger: { type: DataTypes.INTEGER, allowNull: false }, resolved_at: { type: DataTypes.DATE }
  }, {
    sequelize,
    modelName: 'StockAlert',
    tableName: 'StockAlerts',
    underscored: true,

  });
  return StockAlert;
};