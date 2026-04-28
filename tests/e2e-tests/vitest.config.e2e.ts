import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      NOTIFY_MOCK_SERVER_BASE_URL:
        'https://mockserver.transaction.build.account.gov.uk',
      STACK_NAME: 'txma-query-results',
      AWS_REGION: 'eu-west-2'
    },
    globalSetup: ['../shared-test-code/setup/setup.ts'],
    include: ['<rootDir>/**/*.spec.ts'],
    testTimeout: 60000
  }
})
