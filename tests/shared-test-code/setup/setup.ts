import { getIntegrationTestEnvironmentVariable } from '../utils/getIntegrationTestEnvironmentVariable'
import { retrieveSSMParameterValue } from './retrieveSSMParameterValue'

// eslint-disable-next-line @typescript-eslint/prefer-namespace-keyword, @typescript-eslint/no-namespace
declare module global {
  const NOTIFY_MOCK_SERVER_BASE_URL: string
  const STACK_NAME: string
  const AWS_REGION: string
}

module.exports = async () => {
  setEnvVarsFromJestGlobals()
  await readEnvVarsFromSSM()
}

const setEnvVarsFromJestGlobals = () => {
  process.env['NOTIFY_MOCK_SERVER_BASE_URL'] =
    global['NOTIFY_MOCK_SERVER_BASE_URL' as keyof typeof global]

  process.env['STACK_NAME'] = global['STACK_NAME' as keyof typeof global]

  process.env['AWS_REGION'] = global['AWS_REGION' as keyof typeof global]
}

const readEnvVarsFromSSM = async () => {
  process.env['SQS_OPERATIONS_FUNCTION_NAME'] = await retrieveSSMParameterValue(
    `/tests/${getIntegrationTestEnvironmentVariable(
      'STACK_NAME'
    )}/SqsOperationsFunctionName`
  )

  process.env['INTEGRATION_TESTS_TRIGGER_QUEUE_URL'] =
    await retrieveSSMParameterValue(
      `/tests/${getIntegrationTestEnvironmentVariable(
        'STACK_NAME'
      )}/WriteTestDataToAthenaBucketQueueUrl`
    )
  process.env['SECURE_DOWNLOAD_BASE_URL'] = await retrieveSSMParameterValue(
    `/tests/${getIntegrationTestEnvironmentVariable(
      'STACK_NAME'
    )}/SecureDownloadWebsiteBaseUrl`
  )
}
