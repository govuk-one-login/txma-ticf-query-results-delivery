import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput
} from '@aws-sdk/client-dynamodb'
import { TEST_ZENDESK_TICKET_ID } from '../../../../src/utils/tests/setup/testConstants'
import { getIntegrationTestEnvironmentVariable } from '../getIntegrationTestEnvironmentVariable'

export const createOrUpdateDbHashRecord = (
  downloadHash: string,
  downloadsRemaining = 3,
  daysOld = 0
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
      s3ResultsKey: {
        S: getIntegrationTestEnvironmentVariable('S3_RESULTS_KEY')
      },
      s3ResultsBucket: {
        S: getIntegrationTestEnvironmentVariable('S3_RESULTS_BUCKET')
      },
      createdDate: {
        N: (Date.now() - daysOld * 1000 * 3600 * 24).toString()
      },
      zendeskId: {
        S: TEST_ZENDESK_TICKET_ID
      }
    }
  } as PutItemCommandInput
  return ddbClient.send(new PutItemCommand(putItemCommandInput))
}
