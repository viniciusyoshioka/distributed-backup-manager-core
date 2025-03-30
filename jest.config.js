import { pathsToModuleNameMapper } from 'ts-jest'

import tsconfig from './tsconfig.json' assert { type: 'json' }


/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: false,
  roots: ['<rootDir>'],
  modulePaths: [tsconfig.compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths),
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
