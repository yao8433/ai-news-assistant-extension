module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    'backend/**/*.js',
    '!src/news-sites-config.js', // Exclude large config file from coverage
    '!backend/node_modules/**',
    '!**/node_modules/**',
    '!coverage/**',
    '!tests/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Module paths
  roots: ['<rootDir>/src', '<rootDir>/backend', '<rootDir>/tests'],
  
  // Transform configuration for ES6 modules
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Mock patterns
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@backend/(.*)$': '<rootDir>/backend/$1'
  }
};