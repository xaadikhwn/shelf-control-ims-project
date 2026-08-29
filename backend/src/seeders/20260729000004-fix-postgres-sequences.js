'use strict';

// The other seeders insert explicit primary keys (Roles, Users, Categories,
// Customers, Suppliers, Employees, Expenses). On MySQL, AUTO_INCREMENT
// advances to stay past any explicitly-inserted value automatically; Postgres
// SERIAL/IDENTITY sequences do not — they're only bumped by nextval(), which
// an explicit-id insert never calls. Left alone, the first row a user creates
// through the app for any of these tables (e.g. adding a new customer) would
// collide with a seeded id and fail with a duplicate key error. This is a
// no-op on other dialects and safe to re-run (it always syncs to the true
// current MAX(id), whatever that is at the time).
const TABLES = ['Roles', 'Users', 'Categories', 'Customers', 'Suppliers', 'Employees', 'Expenses'];

module.exports = {
  async up(queryInterface) {
    if (queryInterface.sequelize.getDialect() !== 'postgres') return;

    for (const table of TABLES) {
      await queryInterface.sequelize.query(
        `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1))`
      );
    }
  },

  async down() {
    // Nothing to undo — this only ever moves a sequence forward to match
    // existing data, it doesn't change any rows.
  },
};
