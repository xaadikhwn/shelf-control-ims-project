'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Roles', [
      { name: 'Administrator', description: 'Full access', created_at: new Date(), updated_at: new Date() },
      { name: 'Manager', description: 'Manager access', created_at: new Date(), updated_at: new Date() },
      { name: 'User', description: 'Read access', created_at: new Date(), updated_at: new Date() }
    ], { ignoreDuplicates: true });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};