import { retrieveSSMParameterValue } from './retrieveSSMParameterValue'
import { retrieveStackOutput } from './retrieveStackOutput'
const stackName = 'txma-query-results'
const region = 'eu-west-2'

module.exports = async () => {
  setRegionEnvVar()
  await readEnvVarFromSSM()
  await setEnvVarFromStackOutput()
}

const setRegionEnvVar = () => {
  process.env['AWS_REGION'] = region
}

const readEnvVarFromSSM = async () => {
  process.env['SQS_OPERATIONS_FUNCTION_NAME'] = await retrieveSSMParameterValue(
    `/tests/${stackName}/SqsOperationsFunctionName`
  )
}

const setEnvVarFromStackOutput = async () => {
  const stackOutputs = await retrieveStackOutput(stackName, region)
  if (!stackOutputs[0].OutputValue) {
    throw new Error(`Stack output fdr query url not defined`)
  }
  process.env['NTEGRATION_TESTS_TRIGGER_QUEUE_URL'] =
    stackOutputs[0].OutputValue
}
