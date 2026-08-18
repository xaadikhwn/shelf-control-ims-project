const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function generate() {
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('admin123', salt);

  const roleSeed = [
    "'use strict';",
    "module.exports = {",
    "  async up(queryInterface, Sequelize) {",
    "    await queryInterface.bulkInsert('Roles', [",
    "      { name: 'Administrator', description: 'Full access', created_at: new Date(), updated_at: new Date() },",
    "      { name: 'Manager', description: 'Manager access', created_at: new Date(), updated_at: new Date() },",
    "      { name: 'User', description: 'Read access', created_at: new Date(), updated_at: new Date() }",
    "    ], {});",
    "  },",
    "  async down(queryInterface, Sequelize) {",
    "    await queryInterface.bulkDelete('Roles', null, {});",
    "  }",
    "};"
  ].join('\n');

  const adminSeed = [
    "'use strict';",
    "module.exports = {",
    "  async up(queryInterface, Sequelize) {",
    "    const roles = await queryInterface.sequelize.query('SELECT id from Roles where name=\"Administrator\";');",
    "    const adminRoleId = roles[0][0] ? roles[0][0].id : 1;",
    "    await queryInterface.bulkInsert('Users', [{",
    "      full_name: 'System Admin',",
    "      email: 'admin@bizmanage.com',",
    "      password_hash: '" + passwordHash + "',",
    "      role_id: adminRoleId,",
    "      is_active: true,",
    "      created_at: new Date(),",
    "      updated_at: new Date()",
    "    }], {});",
    "  },",
    "  async down(queryInterface, Sequelize) {",
    "    await queryInterface.bulkDelete('Users', { email: 'admin@bizmanage.com' }, {});",
    "  }",
    "};"
  ].join('\n');

  fs.writeFileSync(path.join(__dirname, 'src', 'seeders', '20260727000001-roles.js'), roleSeed);
  fs.writeFileSync(path.join(__dirname, 'src', 'seeders', '20260727000002-admin-user.js'), adminSeed);
  console.log('Seeders generated.');
}

generate();
