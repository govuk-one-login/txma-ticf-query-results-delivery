import { retrieveSSMParameterValue } from './retrieveSSMParameterValue'
import { retrieveStackOutput } from './retrieveStackOutput'
const stackName = 'txma-query-results'
const region = 'eu-west-2'

// eslint-disable-next-line @typescript-eslint/prefer-namespace-keyword, @typescript-eslint/no-namespace
declare module global {
  const NOTIFY_MOCK_SERVER_BASE_URL: string
}

module.exports = async () => {
  setRegionEnvVar()
  setEnvVarFromJestGlobals()
  await readEnvVarsFromSSM()
  await setEnvVarFromStackOutput()
}

const setRegionEnvVar = () => {
  process.env['AWS_REGION'] = region
}

const setEnvVarFromJestGlobals = () => {
  process.env['NOTIFY_MOCK_SERVER_BASE_URL'] =
    global['NOTIFY_MOCK_SERVER_BASE_URL' as keyof typeof global]
}

const readEnvVarsFromSSM = async () => {
  process.env['SQS_OPERATIONS_FUNCTION_NAME'] = await retrieveSSMParameterValue(
    `/tests/${stackName}/SqsOperationsFunctionName`
  )
  process.env['INTEGRATION_TESTS_TRIGGER_QUEUE_URL'] =
    await retrieveSSMParameterValue(`QRIntegrationTestsTriggerQueueUrl`)
}

const setEnvVarFromStackOutput = async () => {
  const stackOutputs = await retrieveStackOutput(stackName, region)
  if (!stackOutputs[0].OutputValue) {
    throw new Error(`Stack output fdr query url not defined`)
  }
  process.env['NTEGRATION_TESTS_TRIGGER_QUEUE_URL'] =
    stackOutputs[0].OutputValue
}
