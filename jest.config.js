
/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: false,
  roots: ['<rootDir>'],
  testMatch: [
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.spec.ts',
  ],
  testPathIgnorePatterns: [
    'node_modules',
    '<rootDir>/dist',
    '<rootDir>/libs',
  ],
}
