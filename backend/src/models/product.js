const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, { foreignKey: 'category_id' });
    }
  }
  Product.init({
    sku: { type: DataTypes.STRING, allowNull: false, unique: true }, name: { type: DataTypes.STRING, allowNull: false }, category_id: { type: DataTypes.INTEGER, references: { model: 'Categories', key: 'id' } }, quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, reorder_point: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, cost_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, sale_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, status: { type: DataTypes.ENUM('in-stock', 'low-stock', 'out-of-stock'), defaultValue: 'out-of-stock' }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'Products',
    underscored: true,

  });
  return Product;
};