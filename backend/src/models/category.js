const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // define association here
    }
  }
  Category.init({
    name: { type: DataTypes.STRING, allowNull: false }, description: { type: DataTypes.TEXT }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'Categories',
    underscored: true,

  });
  return Category;
};