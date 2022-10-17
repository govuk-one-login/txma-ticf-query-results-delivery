import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput
} from '@aws-sdk/client-dynamodb'
import { getIntegrationTestEnvironmentVariable } from '../getIntegrationTestEnvironmentVariable'

export const createOrUpdateDbHashRecord = (
  downloadHash: string,
  downloadsRemaining = 3
) => {
  const ddbClient = new DynamoDBClient({
    region: getIntegrationTestEnvironmentVariable('AWS_REGION')
  })
  const putItemCommandInput = {
    TableName: getIntegrationTestEnvironmentVariable(
      'DOWNLOAD_DYNAMODB_TABLE_NAME'
    ),
    Item: {
      downloadHash: { S: downloadHash },
      downloadsRemaining: { N: downloadsRemaining.toString() },
      s3ResultsArn: { S: 'myArn' }
    }
  } as PutItemCommandInput
  return ddbClient.send(new PutItemCommand(putItemCommandInput))
}
