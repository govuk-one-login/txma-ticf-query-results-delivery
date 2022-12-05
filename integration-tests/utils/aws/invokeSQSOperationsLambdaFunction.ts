import { getIntegrationTestEnvironmentVariable } from '../getIntegrationTestEnvironmentVariable'
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'
import {
  CreateResultFileSQSPayload,
  QueryCompleteSQSPayload
} from '../types/sqsPayload'

export const invokeSQSOperationsLambda = async (
  payload: CreateResultFileSQSPayload | QueryCompleteSQSPayload
) => {
  const input = {
    FunctionName: 'txma-qr-dev-tools-sqs-operations',
    Payload: jsonToUint8Array(payload)
  }

  const lambdaClient = new LambdaClient({
    region: getIntegrationTestEnvironmentVariable('AWS_REGION')
  })
  await lambdaClient.send(new InvokeCommand(input))
}

const jsonToUint8Array = (
  json: CreateResultFileSQSPayload | QueryCompleteSQSPayload
): Uint8Array => {
  const string = JSON.stringify(json, null, 0)
  const uint8Array = new Uint8Array()

  for (let i = 0; i < string.length; i++) {
    uint8Array[i] = string.charCodeAt(i)
  }
  return uint8Array
}
