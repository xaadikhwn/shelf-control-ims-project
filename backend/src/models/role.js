const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      // define association here
    }
  }
  Role.init({
    name: { type: DataTypes.STRING, allowNull: false, unique: true }, description: { type: DataTypes.STRING }
  }, {
    sequelize,
    modelName: 'Role',
    tableName: 'Roles',
    underscored: true,

  });
  return Role;
};