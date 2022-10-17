import { IntegrationTestEnvironmentVariable } from './types/integrationTestEnvironmentVariable'

export const getIntegrationTestEnvironmentVariable = (
  name: IntegrationTestEnvironmentVariable['name']
) => {
  const env = process.env[name]

  if (env === undefined || env === null)
    throw Error(`Missing environment variable: ${name}`)

  return env
}
