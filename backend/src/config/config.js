require('dotenv').config();

const normalizeDialect = (value) => {
  if (!value) return undefined;
  if (value.toLowerCase() === 'tidb') return 'mysql';
  return value;
};

// DATABASE_URL's own prefix always wins over DB_DIALECT: when a connection
// string is provided (e.g. a Supabase postgres:// URL), it unambiguously
// states the real dialect, and a stale/leftover DB_DIALECT env var (like one
// left over from a previous MySQL setup) must not override it and cause the
// app to speak the wrong wire protocol to the database host.
const getDialect = (defaultDialect = 'sqlite') => {
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL.toLowerCase();
    if (url.startsWith('mysql://') || url.startsWith('mysql2://')) return 'mysql';
    if (url.startsWith('postgres://') || url.startsWith('postgresql://')) return 'postgres';
  }

  const configuredDialect = normalizeDialect(process.env.DB_DIALECT);
  if (configuredDialect) return configuredDialect;

  return defaultDialect;
};

// Sequelize's ConnectionManager loads the dialect driver via
// require(moduleName), where moduleName is a runtime variable — bundlers
// that statically trace require() calls to decide what to include in a
// serverless function (e.g. Vercel's) can't follow that, so the driver gets
// silently left out of the deployed bundle even though it's genuinely
// installed ("Please install pg package manually" at runtime). Passing the
// module in directly via a static, literal require() here makes it
// traceable and sidesteps Sequelize's dynamic require entirely.
const getDialectModule = (dialectName) => {
  if (dialectName === 'postgres') return require('pg');
  if (dialectName === 'mysql') return require('mysql2');
  return undefined;
};

const getDialectOptions = () => {
  if (process.env.DB_SSL === 'true') {
    return {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    };
  }

  return {};
};

const dialect = getDialect('sqlite');

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'bizmanage',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect,
    storage: dialect === 'sqlite' ? (process.env.DB_STORAGE || './bizmanage.sqlite') : undefined,
    logging: false,
    ...(getDialectModule(dialect) ? { dialectModule: getDialectModule(dialect) } : {}),
    ...(Object.keys(getDialectOptions()).length ? { dialectOptions: getDialectOptions() } : {}),
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    // Deliberately IGNORES DB_NAME and always derives a separate, clearly-named
    // test database. tests/setup.js runs `sequelize.sync({ force: true })` —
    // a full drop-and-recreate of every table — before every test run. If this
    // block honoured DB_NAME the way development/production do, a populated
    // .env (which sets DB_NAME explicitly) would make `npm test` silently wipe
    // the development or even production database. This must never be able to
    // resolve to the same database as the other two environments.
    database: `${(process.env.DB_NAME || 'bizmanage').replace(/_test$/, '')}_test`,
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: getDialect('sqlite'),
    storage: process.env.DB_STORAGE || ':memory:',
    logging: false,
    ...(getDialectModule(getDialect('sqlite')) ? { dialectModule: getDialectModule(getDialect('sqlite')) } : {}),
    ...(Object.keys(getDialectOptions()).length ? { dialectOptions: getDialectOptions() } : {}),
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: getDialect('mysql'),
    logging: false,
    ...(process.env.DATABASE_URL ? { url: process.env.DATABASE_URL } : {}),
    ...(getDialectModule(getDialect('mysql')) ? { dialectModule: getDialectModule(getDialect('mysql')) } : {}),
    ...(Object.keys(getDialectOptions()).length ? { dialectOptions: getDialectOptions() } : {}),
  },
};

