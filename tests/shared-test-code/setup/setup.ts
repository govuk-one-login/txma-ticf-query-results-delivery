import { getIntegrationTestEnvironmentVariable } from '../utils/getIntegrationTestEnvironmentVariable'
import { checkSecretsSet, retrieveSecretValue } from './retrieveSecretValue'
import { retrieveSSMParameterValue } from './retrieveSSMParameterValue'

// eslint-disable-next-line @typescript-eslint/prefer-namespace-keyword, @typescript-eslint/no-namespace
declare module global {
  const NOTIFY_MOCK_SERVER_BASE_URL: string
  const STACK_NAME: string
  const AWS_REGION: string
}
const region = global.AWS_REGION
const stack = global.STACK_NAME

module.exports = async () => {
  setEnvVarsFromJestGlobals()
  await readEnvVarsFromSecrets()
  await readEnvVarsFromSSM()
}

const setEnvVarsFromJestGlobals = () => {
  process.env['NOTIFY_MOCK_SERVER_BASE_URL'] =
    global['NOTIFY_MOCK_SERVER_BASE_URL' as keyof typeof global]

  process.env['STACK_NAME'] = global['STACK_NAME' as keyof typeof global]

  process.env['AWS_REGION'] = global['AWS_REGION' as keyof typeof global]
}

const readEnvVarsFromSecrets = async () => {
  const notifySecretName = `tests/${stack}/NotifySecrets`
  const notifySecrets = await retrieveSecretValue(notifySecretName, region)

  if (process.env['NOTIFY_MOCK_SERVER_BASE_URL']) {
    checkSecretsSet(notifySecretName, notifySecrets, ['EMAIL_RECIPIENT'])
    process.env['EMAIL_RECIPIENT'] = notifySecrets['EMAIL_RECIPIENT']
  } else {
    checkSecretsSet(notifySecretName, notifySecrets, [
      'NOTIFY_API_KEY',
      'EMAIL_RECIPIENT'
    ])
    process.env['NOTIFY_API_KEY'] = notifySecrets['NOTIFY_API_KEY']
    process.env['EMAIL_RECIPIENT'] = notifySecrets['EMAIL_RECIPIENT']
  }
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
