import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  coveragePathIgnorePatterns: ['/dist/'],
  preset: 'ts-jest',
  setupFiles: ['<rootDir>/src/utils/tests/setup/testEnvVars.ts'],
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  verbose: true
}

export default config
