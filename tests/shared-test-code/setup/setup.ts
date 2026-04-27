import { checkSecretsSet, retrieveSecretValue } from './retrieveSecretValue'
import { retrieveSSMParameterValue } from './retrieveSSMParameterValue'

const region = process.env['AWS_REGION'] as string
const stack = process.env['STACK_NAME'] as string

const isMainStack = stack === 'txma-query-results'

export default async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  isMainStack ? await readEnvVarsFromSecrets() : setMockServerNotifyDetails()
  await readEnvVarsFromSSM()
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
  process.env['EMAIL_RECIPIENT'] = 'testRecipient@example.gov.uk'
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
