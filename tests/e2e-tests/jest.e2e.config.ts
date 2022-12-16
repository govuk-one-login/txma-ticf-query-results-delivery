import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  testPathIgnorePatterns: ['/src/'],
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
  verbose: true,
  setupFiles: ['<rootDir>/../shared-test-code/setup/setup.ts'],
  globals: {
    STACK_NAME: 'txma-query-results',
    AWS_REGION: 'eu-west-2'
  },
  testTimeout: 60000
}

export default config
