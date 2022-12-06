import { retrieveSSMParameterValue } from './retrieveSSMParameterValue'
const stackName = 'txma-query-results'
const region = 'eu-west-2'

module.exports = async () => {
  await readEnvVarsFromSSM()
  setRegionEnvVar()
}

const readEnvVarsFromSSM = async () => {
  process.env['INTEGRATION_TESTS_TRIGGER_QUEUE_URL'] =
    await retrieveSSMParameterValue(
      `/tests/${stackName}/QRIntegrationTestsTriggerQueueUrl`
    )
}

const setRegionEnvVar = () => {
  process.env['AWS_REGION'] = region
}
