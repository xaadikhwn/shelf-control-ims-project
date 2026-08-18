const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      // define association here
    }
  }
  Customer.init({
    account_code: { type: DataTypes.STRING, allowNull: false, unique: true }, company_name: { type: DataTypes.STRING, allowNull: false }, contact_person: { type: DataTypes.STRING }, phone: { type: DataTypes.STRING }, email: { type: DataTypes.STRING }, credit_limit: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }, last_order_at: { type: DataTypes.DATE }, status: { type: DataTypes.ENUM('active', 'warning', 'overdue'), defaultValue: 'active' }
  }, {
    sequelize,
    modelName: 'Customer',
    tableName: 'Customers',
    underscored: true,

  });
  return Customer;
};