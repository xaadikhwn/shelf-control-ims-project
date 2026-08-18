const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Role, { foreignKey: 'role_id' });
    }
  }
  User.init({
    full_name: { type: DataTypes.STRING, allowNull: false }, email: { type: DataTypes.STRING, allowNull: false, unique: true }, password_hash: { type: DataTypes.STRING, allowNull: false }, role_id: { type: DataTypes.INTEGER, references: { model: 'Roles', key: 'id' } }, avatar_url: { type: DataTypes.STRING }, is_active: { type: DataTypes.BOOLEAN, defaultValue: true }, last_login_at: { type: DataTypes.DATE }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    underscored: true,

  });
  return User;
};