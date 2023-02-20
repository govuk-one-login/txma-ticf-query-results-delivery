import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  coveragePathIgnorePatterns: ['/.yarn/', '/dist/'],
  globals: {
    NOTIFY_MOCK_SERVER_BASE_URL:
      'https://mockserver.transaction.build.account.gov.uk',
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
        outputDirectory: '<rootDir>/../reports/allure-results',
        ancestorSeparator: ',',
        includeConsoleOutput: true
      }
    ]
  ],
  setupFiles: ['<rootDir>/../shared-test-code/setup/setup.ts'],
  testMatch: ['<rootDir>/**/*.spec.ts'],
  testTimeout: 60000,
  verbose: true
}

export default config
