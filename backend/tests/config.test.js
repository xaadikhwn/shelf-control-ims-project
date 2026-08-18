describe('database config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses mysql dialect for TiDB when DB_DIALECT is tidb', () => {
    process.env.DB_DIALECT = 'tidb';

    const config = require('../src/config/config');

    expect(config.development.dialect).toBe('mysql');
    expect(config.production.dialect).toBe('mysql');
  });

  it('infers mysql dialect from a mysql connection URL', () => {
    delete process.env.DB_DIALECT;
    process.env.DATABASE_URL = 'mysql://root:password@gateway01.us-east1.prod.aws.tidbcloud.com:4000/test';

    const config = require('../src/config/config');

    expect(config.development.dialect).toBe('mysql');
    expect(config.production.url).toBe(process.env.DATABASE_URL);
  });
});
