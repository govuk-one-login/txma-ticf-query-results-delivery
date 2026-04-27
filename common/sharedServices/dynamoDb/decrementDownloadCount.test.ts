import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb'
import {
  DOWNLOAD_HASH,
  TEST_FRAUD_TABLE
} from '../../../common/utils/tests/setup/testConstants'
import { decrementDownloadCount } from '../../../common/sharedServices/dynamoDb/decrementDownloadCount'
import { mockClient } from 'aws-sdk-client-mock'

const dynamoMock = mockClient(DynamoDBClient)

describe('decrementDownloadCount', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should run correct command to decrement downloads remaining', async () => {
    await decrementDownloadCount(DOWNLOAD_HASH)
    const calls = dynamoMock.commandCalls(UpdateItemCommand)
    expect(calls).toHaveLength(1)
    expect(calls[0].args[0].input).toMatchObject({
      TableName: TEST_FRAUD_TABLE,
      Key: { downloadHash: { S: DOWNLOAD_HASH } },
      UpdateExpression: `ADD downloadsRemaining :increment`,
      ExpressionAttributeValues: {
        ':increment': { N: '-1' }
      }
    })
  })
})
