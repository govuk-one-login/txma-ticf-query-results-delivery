import { defineConfig } from 'vitest/config'

process.env.STACK_NAME = 'txma-query-results'
process.env.AWS_REGION = 'eu-west-2'
process.env.NOTIFY_MOCK_SERVER_BASE_URL =
  'https://mockserver.transaction.build.account.gov.uk'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: ['tests/shared-test-code/setup/setup.ts'],
    include: ['tests/integration-tests/**/*.spec.ts'],
    testTimeout: 60000
  }
})
