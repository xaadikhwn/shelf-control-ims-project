const express = require('express');
const { checkStockAlerts } = require('../jobs/stockAlert.job');

const router = express.Router();

// One-shot endpoint for platforms without an in-process scheduler (e.g. Vercel
// Serverless Functions, which don't keep node-cron's setInterval loop alive
// between invocations). Wire this to Vercel Cron (vercel.json `crons`) or an
// external pinger (e.g. cron-job.org) instead of relying on startStockAlertCron.
// Vercel Cron sends GET requests, and auto-attaches `Authorization: Bearer
// $CRON_SECRET` when a CRON_SECRET env var is set on the project.
router.get('/stock-alert', async (req, res) => {
  const configuredSecret = process.env.CRON_SECRET;
  if (configuredSecret) {
    const authHeader = req.headers.authorization || '';
    const providedSecret = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : req.query.secret;
    if (providedSecret !== configuredSecret) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid cron secret' } });
    }
  }

  await checkStockAlerts();
  res.json({ success: true, message: 'Stock alert check completed' });
});

module.exports = router;
