require('dotenv').config();
const mysql = require('mysql2/promise');
const app = require('./app');
const db = require('./models');
const { startStockAlertCron } = require('./jobs/stockAlert.job');
const { autoSeed } = require('./utils/autoSeed');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

async function ensureDatabaseExists() {
  const databaseName = process.env.DB_NAME;
  if (!databaseName || process.env.DB_DIALECT === 'sqlite') return;

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
    console.log(`Database ${databaseName} is ready.`);
  } catch (error) {
    console.warn('Database readiness check warning:', error.message);
  } finally {
    await connection.end();
  }
}

async function startServer() {
  try {
    await ensureDatabaseExists();
    await db.sequelize.authenticate();
    console.log('Database connected successfully.');

    await db.sequelize.sync({ force: false });
    await autoSeed();

    app.listen(PORT, HOST, () => {
      console.log(`Server is running on http://${HOST}:${PORT}`);
      startStockAlertCron();
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();
// Server updated at 2026-07-29

