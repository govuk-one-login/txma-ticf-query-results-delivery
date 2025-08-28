import type { JestConfigWithTsJest } from 'ts-jest'

const baseCoverage = [
  // scan all files
  '<rootDir>/**/*.ts',
  '!**/scripts/**',
  // types can be ignored
  '!**/interface/**',
  '!**/interfaces/**',
  '!**/type/**',
  '!**/types/**',
  '!**/logger.ts',
  '!**/tests/**',
  '!**/*.config.ts',
  // ignore dotfiles
  '!**/.*'
]

const config: JestConfigWithTsJest = {
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
  preset: 'ts-jest',
  verbose: true,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/common/**/*.test.ts'],
  setupFiles: ['<rootDir>/common/utils/tests/setup/testEnvVars.ts'],
  collectCoverageFrom: baseCoverage,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10
    },
    '**/*.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10
    }
  }
}

export default config
