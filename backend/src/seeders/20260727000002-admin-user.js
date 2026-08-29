'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    const adminRoleId = await queryInterface.rawSelect(
      'Roles',
      { where: { name: 'Administrator' } },
      'id'
    ) || 1;
    await queryInterface.bulkInsert('Users', [{
      full_name: 'System Admin',
      email: 'admin@bizmanage.com',
      password_hash: '$2b$12$RiGalL.xxamtq/6KRLfDgeklolAFTjZFp0AwibCE7p1Aa5LHlcxhi',
      role_id: adminRoleId,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }], { ignoreDuplicates: true });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'admin@bizmanage.com' }, {});
  }
};