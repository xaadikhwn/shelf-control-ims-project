const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PasswordResetToken extends Model {
    static associate(models) {
      PasswordResetToken.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  PasswordResetToken.init({
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } }, token_hash: { type: DataTypes.STRING, allowNull: false }, expires_at: { type: DataTypes.DATE, allowNull: false }, used_at: { type: DataTypes.DATE }
  }, {
    sequelize,
    modelName: 'PasswordResetToken',
    tableName: 'PasswordResetTokens',
    underscored: true,

  });
  return PasswordResetToken;
};