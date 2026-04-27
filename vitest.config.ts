import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'common/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    setupFiles: ['./common/utils/tests/setup/testEnvVars.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'common/**/*.ts'],
      exclude: [
        '**/scripts/**',
        '**/interface/**',
        '**/interfaces/**',
        '**/type/**',
        '**/types/**',
        '**/logger.ts',
        '**/tests/**',
        '**/*.config.ts',
        '**/*.test.ts'
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: -10
      }
    }
  }
})
