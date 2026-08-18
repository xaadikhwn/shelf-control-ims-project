const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RefreshToken extends Model {
    static associate(models) {
      RefreshToken.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  RefreshToken.init({
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } }, token_hash: { type: DataTypes.STRING, allowNull: false }, expires_at: { type: DataTypes.DATE, allowNull: false }, revoked_at: { type: DataTypes.DATE }
  }, {
    sequelize,
    modelName: 'RefreshToken',
    tableName: 'RefreshTokens',
    underscored: true,

  });
  return RefreshToken;
};