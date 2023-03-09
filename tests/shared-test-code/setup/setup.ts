import { checkSecretsSet, retrieveSecretValue } from './retrieveSecretValue'
import { retrieveSSMParameterValue } from './retrieveSSMParameterValue'

// eslint-disable-next-line @typescript-eslint/prefer-namespace-keyword, @typescript-eslint/no-namespace
declare module global {
  const NOTIFY_MOCK_SERVER_BASE_URL: string
  const STACK_NAME: string
  const AWS_REGION: string
}
const region = global.AWS_REGION
const stack = process.env.STACK_NAME
  ? process.env.STACK_NAME
  : global.STACK_NAME

const isMainStack = stack === 'txma-query-results'

module.exports = async () => {
  setEnvVarsFromJestGlobals()
  isMainStack ? await readEnvVarsFromSecrets() : setMockServerNotifyDetails()
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
  checkSecretsSet(notifySecretName, notifySecrets, [
    'NOTIFY_API_KEY',
    'EMAIL_RECIPIENT'
  ])
  process.env['NOTIFY_API_KEY'] = notifySecrets['NOTIFY_API_KEY']
  process.env['EMAIL_RECIPIENT'] = notifySecrets['EMAIL_RECIPIENT']
}

const setMockServerNotifyDetails = () => {
  process.env['NOTIFY_API_KEY'] = 'someFakeNotifyKey'
  process.env['EMAIL_RECIPIENT'] = 'testRecipient@test.gov.uk'
}

const readEnvVarsFromSSM = async () => {
  process.env['SQS_OPERATIONS_FUNCTION_NAME'] = await retrieveSSMParameterValue(
    `/tests/${stack}/SqsOperationsFunctionName`
  )

  process.env['INTEGRATION_TESTS_TRIGGER_QUEUE_URL'] =
    await retrieveSSMParameterValue(
      `/tests/${stack}/WriteTestDataToAthenaBucketQueueUrl`
    )
  process.env['SECURE_DOWNLOAD_BASE_URL'] = await retrieveSSMParameterValue(
    `/tests/${stack}/SecureDownloadWebsiteBaseUrl`
  )
}
