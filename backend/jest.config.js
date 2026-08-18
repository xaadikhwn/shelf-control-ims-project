module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  setupFilesAfterEnv: ['./tests/setup.js']
};
