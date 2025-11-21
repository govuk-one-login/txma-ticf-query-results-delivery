import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  coveragePathIgnorePatterns: ['/dist/'],
  globals: {
    STACK_NAME: 'txma-query-results',
    AWS_REGION: 'eu-west-2'
  },
  preset: 'ts-jest',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        suiteName: 'TxMA query results delivery e2e tests',
        outputDirectory: '<rootDir>/../reports/results',
        ancestorSeparator: ',',
        includeConsoleOutput: true
      }
    ]
  ],
  runner: 'jest-runner',
  setupFiles: ['<rootDir>/../shared-test-code/setup/setup.ts'],
  testMatch: ['<rootDir>/**/*.spec.ts'],
  testTimeout: 60000,
  transform: {
    '^.+.ts$': ['ts-jest', { useESM: true }]
  },
  verbose: true
}

export default config
