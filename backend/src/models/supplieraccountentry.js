const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SupplierAccountEntry extends Model {
    static associate(models) {
      SupplierAccountEntry.belongsTo(models.Supplier, { foreignKey: 'supplier_id' });
    }
  }
  SupplierAccountEntry.init({
    supplier_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Suppliers', key: 'id' } }, entry_type: { type: DataTypes.ENUM('purchase', 'payment', 'adjustment'), allowNull: false }, reference: { type: DataTypes.STRING }, amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, balance_after: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  }, {
    sequelize,
    modelName: 'SupplierAccountEntry',
    tableName: 'SupplierAccountEntries',
    underscored: true,

  });
  return SupplierAccountEntry;
};