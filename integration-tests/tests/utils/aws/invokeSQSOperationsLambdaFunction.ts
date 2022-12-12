import { getIntegrationTestEnvironmentVariable } from '../getIntegrationTestEnvironmentVariable'
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'
import { TriggerEndOfFlowSQSPayload } from '../types/sqsPayload'

export const invokeSQSOperationsLambda = async (
  payload: TriggerEndOfFlowSQSPayload
) => {
  const input = {
    FunctionName: getIntegrationTestEnvironmentVariable(
      'SQS_OPERATIONS_FUNCTION_NAME'
    ),
    Payload: jsonToUint8Array(payload)
  }

  const lambdaClient = new LambdaClient({
    region: getIntegrationTestEnvironmentVariable('AWS_REGION')
  })
  await lambdaClient.send(new InvokeCommand(input))
}

const jsonToUint8Array = (json: TriggerEndOfFlowSQSPayload): Uint8Array => {
  const dataString = JSON.stringify(json, null, 0)
  const uint8Array = new Uint8Array(dataString.length)

  for (let i = 0; i < dataString.length; i++) {
    uint8Array[i] = dataString.charCodeAt(i)
  }
  return uint8Array
}
