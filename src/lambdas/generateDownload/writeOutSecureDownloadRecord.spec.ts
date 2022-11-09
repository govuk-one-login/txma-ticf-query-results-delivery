import {
  PutItemCommand,
  DynamoDBClient,
  PutItemCommandInput
} from '@aws-sdk/client-dynamodb'
import { mockClient } from 'aws-sdk-client-mock'
import {
  TEST_ATHENA_QUERY_ID,
  DOWNLOAD_HASH,
  TEST_FRAUD_TABLE,
  TEST_S3_OBJECT_BUCKET,
  TEST_ZENDESK_TICKET_ID
} from '../../utils/tests/setup/testConstants'
import { currentDateEpochMilliseconds } from '../../utils/currentDateEpochMilliseconds'
import { writeOutSecureDownloadRecord } from './writeOutSecureDownloadRecord'
import { when } from 'jest-when'
import 'aws-sdk-client-mock-jest'

jest.mock('../../utils/currentDateEpochMilliseconds', () => ({
  currentDateEpochMilliseconds: jest.fn()
}))

const dynamoMock = mockClient(DynamoDBClient)
const TEST_EPOCH_MILLISECONDS = 1666360736316
describe('writeOutSecureDownloadRecord', () => {
  when(currentDateEpochMilliseconds).mockReturnValue(TEST_EPOCH_MILLISECONDS)
  const basicRecordExpectation: PutItemCommandInput = {
    TableName: TEST_FRAUD_TABLE,
    Item: {
      downloadHash: { S: DOWNLOAD_HASH },
      downloadsRemaining: { N: '2' },
      s3ResultsBucket: { S: TEST_S3_OBJECT_BUCKET },
      s3ResultsKey: { S: `${TEST_ATHENA_QUERY_ID}.csv` },
      zendeskId: { S: TEST_ZENDESK_TICKET_ID },
      createdDate: { N: TEST_EPOCH_MILLISECONDS.toString() }
    }
  }
  it('should write a new secure download record', async () => {
    await writeOutSecureDownloadRecord({
      athenaQueryId: TEST_ATHENA_QUERY_ID,
      downloadHash: DOWNLOAD_HASH,
      zendeskId: TEST_ZENDESK_TICKET_ID
    })
    expect(dynamoMock).toHaveReceivedCommandWith(
      PutItemCommand,
      basicRecordExpectation
    )
  })
})
