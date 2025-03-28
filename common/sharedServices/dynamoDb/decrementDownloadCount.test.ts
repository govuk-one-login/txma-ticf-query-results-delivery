import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import {
  DOWNLOAD_HASH,
  TEST_FRAUD_TABLE
} from '../../../common/utils/tests/setup/testConstants'
import { decrementDownloadCount } from '../../../common/sharedServices/dynamoDb/decrementDownloadCount'
import { mockClient } from 'aws-sdk-client-mock'
import 'aws-sdk-client-mock-jest'

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
