/**
 * jest.config.js  (project root)
 *
 * Jest is configured to:
 *  - Transform every .js file with babel-jest so ES-module import/export
 *    syntax is compiled to CommonJS before Jest evaluates it.
 *  - Resolve modules from BOTH the root node_modules AND from
 *    backend/node_modules so that imports like 'sequelize', 'express', etc.
 *    found inside backend/ are discovered automatically.
 *  - Only look for test files inside the top-level /tests/ folder to avoid
 *    conflicts with the React frontend's own jest configuration (react-scripts).
 */

module.exports = {
  // Use the Node.js environment (not jsdom which is the browser default)
  testEnvironment: 'node',

  // Transform all JS files using Babel so ES modules work with Jest
  transform: {
    '^.+\\.js$': 'babel-jest',
  },

  // Only discover tests inside /tests/ (not inside /src/ — that is for React)
  testMatch: ['<rootDir>/tests/**/*.test.js'],

  // Allow Jest to resolve packages from the root AND from backend/node_modules.
  // This is necessary because backend packages (express, sequelize, etc.) live
  // in backend/node_modules, not in the root node_modules.
  moduleDirectories: ['node_modules', 'backend/node_modules'],

  // Show individual test names in the output
  verbose: true,

  // Clear mock state (calls, instances, results) between every test
  clearMocks: true,

  // Collect coverage from the backend source files only
  collectCoverageFrom: [
    'backend/routes/**/*.js',
    'backend/middleware/**/*.js',
    '!backend/middleware/auth.js',  // auth is always mocked in tests
  ],
};
