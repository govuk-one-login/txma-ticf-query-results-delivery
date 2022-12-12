import { getIntegrationTestEnvironmentVariable } from '../tests/utils/getIntegrationTestEnvironmentVariable'
import { retrieveSSMParameterValue } from './retrieveSSMParameterValue'
const region = 'eu-west-2'

// eslint-disable-next-line @typescript-eslint/prefer-namespace-keyword, @typescript-eslint/no-namespace
declare module global {
  const NOTIFY_MOCK_SERVER_BASE_URL: string
  const STACK_NAME: string
}

module.exports = async () => {
  setRegionEnvVar()
  setEnvVarFromJestGlobals()
  await readEnvVarsFromSSM()
}

const setRegionEnvVar = () => {
  process.env['AWS_REGION'] = region
}

const setEnvVarFromJestGlobals = () => {
  process.env['NOTIFY_MOCK_SERVER_BASE_URL'] = process.env[
    'NOTIFY_MOCK_SERVER_BASE_URL'
  ]
    ? process.env['NOTIFY_MOCK_SERVER_BASE_URL']
    : global['NOTIFY_MOCK_SERVER_BASE_URL' as keyof typeof global]

  process.env['STACK_NAME'] = process.env['STACK_NAME']
    ? process.env['STACK_NAME']
    : global['STACK_NAME' as keyof typeof global]
}

const readEnvVarsFromSSM = async () => {
  process.env['SQS_OPERATIONS_FUNCTION_NAME'] = await retrieveSSMParameterValue(
    `/tests/SqsOperationsFunctionName`
  )

  process.env['INTEGRATION_TESTS_TRIGGER_QUEUE_URL'] =
    await retrieveSSMParameterValue(
      '/tests/WriteTestDataToAthenaBucketQueueUrl'
    )
  process.env['SECURE_DOWNLOAD_BASE_URL'] = await retrieveSSMParameterValue(
    `/tests/${getIntegrationTestEnvironmentVariable(
      'STACK_NAME'
    )}/SecureDownloadWebsiteBaseUrl`
  )
}
