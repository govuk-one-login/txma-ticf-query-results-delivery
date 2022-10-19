import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import { mockClient } from 'aws-sdk-client-mock'
import {
  DOWNLOAD_HASH,
  TEST_FRAUD_TABLE
} from '../../utils/tests/setup/testConstants'
import { decrementDownloadCount } from './decrementDownloadCount'
const dynamoMock = mockClient(DynamoDBClient)

describe('decrementDownloadCount', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should run correct command to decrement downloads remaining', async () => {
    await decrementDownloadCount(DOWNLOAD_HASH)
    expect(dynamoMock).toHaveReceivedCommandWith(UpdateItemCommand, {
      TableName: TEST_FRAUD_TABLE,
      Key: { downloadHash: { S: DOWNLOAD_HASH } },
      UpdateExpression: `ADD downloadsRemaining :increment`,
      ExpressionAttributeValues: {
        ':increment': { N: '-1' }
      }
    })
  })
})
