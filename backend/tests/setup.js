const db = require('../src/models');

jest.setTimeout(30000);

beforeAll(async () => {
  // Safety net: this file is about to drop and recreate every table. If a
  // future change to config.js, .env, or NODE_ENV handling ever lets this
  // resolve to anything other than a clearly-disposable test database,
  // fail loudly instead of silently wiping real data.
  const dbName = db.sequelize.getDatabaseName ? db.sequelize.getDatabaseName() : db.sequelize.config.database;
  const dialect = db.sequelize.getDialect();
  const looksLikeTestDb = dialect === 'sqlite' || /_test$/i.test(dbName || '') || dbName === ':memory:';
  if (!looksLikeTestDb) {
    throw new Error(
      `Refusing to run destructive test setup against database "${dbName}" — ` +
      `it does not look like a test database (expected a "_test" suffix or sqlite). ` +
      `Check NODE_ENV and src/config/config.js before running tests again.`
    );
  }

  if (dialect === 'sqlite') {
    await db.sequelize.query('PRAGMA foreign_keys = OFF;');
  }
  await db.sequelize.sync({ force: true });
  if (dialect === 'sqlite') {
    await db.sequelize.query('PRAGMA foreign_keys = ON;');
  }
});

afterAll(async () => {
  await db.sequelize.close();
});
