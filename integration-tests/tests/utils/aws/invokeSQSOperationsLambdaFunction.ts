import { getIntegrationTestEnvironmentVariable } from '../getIntegrationTestEnvironmentVariable'
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'
import { SQSPayload } from '../types/sqsPayload'

export const invokeSQSOperationsLambda = async (payload: SQSPayload) => {
  const input = {
    FunctionName: getIntegrationTestEnvironmentVariable(
      'SQS_OPERATIONS_FUNCTION_NAME'
    ),
    Payload: jsonToUint8Array(payload)
  }

  const lambdaClient = new LambdaClient({
    region: getIntegrationTestEnvironmentVariable('AWS_REGION')
  })
  const result = await lambdaClient.send(new InvokeCommand(input))
  console.log('PAYLOAD', result.Payload)
  return uint8ArrayToJson(result.Payload)
}

const jsonToUint8Array = (json: SQSPayload): Uint8Array => {
  const dataString = JSON.stringify(json, null, 0)
  const uint8Array = new Uint8Array(dataString.length)

  for (let i = 0; i < dataString.length; i++) {
    uint8Array[i] = dataString.charCodeAt(i)
  }
  return uint8Array
}

const uint8ArrayToJson = (binArray: Uint8Array | undefined) => {
  if (!binArray) return {}

  let str = ''

  for (let i = 0; i < binArray.length; i++) {
    str += String.fromCharCode(binArray[i])
  }

  return JSON.parse(str)
}
