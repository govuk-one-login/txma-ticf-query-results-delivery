import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  testPathIgnorePatterns: ['/src/'],
  preset: 'ts-jest',
  verbose: true,
  setupFiles: ['<rootDir>/integration-tests/setup/setup.ts'],
  globals: {
    NOTIFY_MOCK_SERVER_BASE_URL:
      'https://mockserver.transaction.build.account.gov.uk'
  }
}

export default config
