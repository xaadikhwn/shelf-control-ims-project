'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // The initial migration's order_status ENUM was missing 'completed', even
    // though both the SalesOrder model and the sales controller use it when
    // finalising a sale — every sale creation failed with a MySQL "Data
    // truncated for column 'order_status'" error until this was fixed.
    await queryInterface.sequelize.query(
      "ALTER TABLE `SalesOrders` MODIFY COLUMN `order_status` " +
      "ENUM('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled') " +
      "DEFAULT 'pending'"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "ALTER TABLE `SalesOrders` MODIFY COLUMN `order_status` " +
      "ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') " +
      "DEFAULT 'pending'"
    );
  },
};
