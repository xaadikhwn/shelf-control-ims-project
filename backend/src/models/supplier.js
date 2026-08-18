const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Supplier extends Model {
    static associate(models) {
      // define association here
    }
  }
  Supplier.init({
    vendor_code: { type: DataTypes.STRING, allowNull: false, unique: true }, company_name: { type: DataTypes.STRING, allowNull: false }, contact_person: { type: DataTypes.STRING }, phone: { type: DataTypes.STRING }, country: { type: DataTypes.STRING }, credit_terms: { type: DataTypes.STRING }, last_invoice_at: { type: DataTypes.DATE }, status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' }
  }, {
    sequelize,
    modelName: 'Supplier',
    tableName: 'Suppliers',
    underscored: true,

  });
  return Supplier;
};