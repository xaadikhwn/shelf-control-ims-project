const cron = require('node-cron');
const db = require('../models');
const { Op } = require('sequelize');

const checkStockAlerts = async () => {
  console.log('[Cron] Running stock alert check...');
  try {
    const products = await db.Product.findAll();
    let created = 0;
    let resolved = 0;

    for (const product of products) {
      const isLowStock = product.quantity <= product.reorder_point;
      
      if (isLowStock) {
        // Find if there is an unresolved alert
        const existingAlert = await db.StockAlert.findOne({
          where: { product_id: product.id, resolved_at: null }
        });
        
        if (!existingAlert) {
          await db.StockAlert.create({
            product_id: product.id,
            quantity_at_trigger: product.quantity,
            threshold_at_trigger: product.reorder_point,
            triggered_at: new Date()
          });
          created++;
        }
      } else {
        // Find unresolved alerts and resolve them
        const unresolvedAlerts = await db.StockAlert.findAll({
          where: { product_id: product.id, resolved_at: null }
        });
        
        for (const alert of unresolvedAlerts) {
          alert.resolved_at = new Date();
          await alert.save();
          resolved++;
        }
      }
      
      // Compute status based on quantity
      let newStatus = 'in-stock';
      if (product.quantity <= 0) newStatus = 'out-of-stock';
      else if (product.quantity <= product.reorder_point) newStatus = 'low-stock';
      
      if (product.status !== newStatus) {
        product.status = newStatus;
        await product.save();
      }
    }
    
    console.log(`[Cron] Stock alert check completed. Created: ${created}, Resolved: ${resolved}`);
  } catch (error) {
    console.error('[Cron] Error running stock alert check:', error);
  }
};

const startStockAlertCron = () => {
  const schedule = process.env.STOCK_ALERT_CRON || '*/15 * * * *';
  cron.schedule(schedule, checkStockAlerts);
  console.log(`[Cron] Stock alert scheduled with pattern: ${schedule}`);
};

module.exports = { startStockAlertCron, checkStockAlerts };
