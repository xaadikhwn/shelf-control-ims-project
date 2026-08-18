const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    static associate(models) {
      // define association here
    }
  }
  Employee.init({
    emp_code: { type: DataTypes.STRING, allowNull: false, unique: true }, full_name: { type: DataTypes.STRING, allowNull: false }, department: { type: DataTypes.STRING }, role_title: { type: DataTypes.STRING }, gross_salary: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' }
  }, {
    sequelize,
    modelName: 'Employee',
    tableName: 'Employees',
    underscored: true,

  });
  return Employee;
};