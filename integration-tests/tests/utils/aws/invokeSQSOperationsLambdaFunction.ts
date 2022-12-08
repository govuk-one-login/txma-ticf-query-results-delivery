import { getIntegrationTestEnvironmentVariable } from '../getIntegrationTestEnvironmentVariable'
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'
import { TriggerEndOfFlowSQSPayload } from '../types/sqsPayload'

export const invokeSQSOperationsLambda = async (
  payload: TriggerEndOfFlowSQSPayload
) => {
  //TODO: replace with env var SQS_OPERATIONS_FUNCTION_NAME
  const input = {
    FunctionName: 'txma-qr-dev-tools-sqs-operations',
    Payload: jsonToUint8Array(payload)
  }

  const lambdaClient = new LambdaClient({
    region: getIntegrationTestEnvironmentVariable('AWS_REGION')
  })
  await lambdaClient.send(new InvokeCommand(input))
}

const jsonToUint8Array = (json: TriggerEndOfFlowSQSPayload): Uint8Array => {
  const string = JSON.stringify(json, null, 0)
  const uint8Array = new Uint8Array()

  for (let i = 0; i < string.length; i++) {
    uint8Array[i] = string.charCodeAt(i)
  }
  return uint8Array
}
