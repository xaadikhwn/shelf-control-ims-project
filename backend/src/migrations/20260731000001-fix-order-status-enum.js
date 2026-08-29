'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // The initial migration's order_status ENUM was missing 'completed', even
    // though both the SalesOrder model and the sales controller use it when
    // finalising a sale — every sale creation failed with a MySQL "Data
    // truncated for column 'order_status'" error until this was fixed.
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      // Postgres enums are a distinct named type (created by the initial
      // migration as enum_SalesOrders_order_status) — MySQL's inline
      // MODIFY COLUMN ENUM(...) syntax doesn't apply here.
      await queryInterface.sequelize.query(
        'ALTER TYPE "enum_SalesOrders_order_status" ADD VALUE IF NOT EXISTS \'completed\''
      );
    } else {
      await queryInterface.sequelize.query(
        "ALTER TABLE `SalesOrders` MODIFY COLUMN `order_status` " +
        "ENUM('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled') " +
        "DEFAULT 'pending'"
      );
    }
  },

  async down(queryInterface, Sequelize) {
    if (queryInterface.sequelize.getDialect() === 'postgres') {
      // Postgres can't drop an enum value in place without rebuilding the
      // type (and reassigning every column/row using it), which isn't safe
      // to do unconditionally in a down-migration — left as a no-op.
      return;
    }

    await queryInterface.sequelize.query(
      "ALTER TABLE `SalesOrders` MODIFY COLUMN `order_status` " +
      "ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') " +
      "DEFAULT 'pending'"
    );
  },
};
