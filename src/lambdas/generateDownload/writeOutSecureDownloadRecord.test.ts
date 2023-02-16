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
  TEST_QUERY_RESULTS_BUCKET_NAME,
  TEST_ZENDESK_TICKET_ID,
  TEST_DATABASE_TTL_HOURS
} from '../../utils/tests/setup/testConstants'
import {
  currentDateEpochMilliseconds,
  currentDateEpochSeconds
} from '../../utils/currentDateEpoch'
import { writeOutSecureDownloadRecord } from './writeOutSecureDownloadRecord'
import { when } from 'jest-when'
import 'aws-sdk-client-mock-jest'

jest.mock('../../utils/currentDateEpoch', () => ({
  currentDateEpochMilliseconds: jest.fn(),
  currentDateEpochSeconds: jest.fn()
}))

const dynamoMock = mockClient(DynamoDBClient)
const TEST_EPOCH_MILLISECONDS = 1666360736316
const TEST_EPOCH_SECONDS = 1666360736
describe('writeOutSecureDownloadRecord', () => {
  when(currentDateEpochMilliseconds).mockReturnValue(TEST_EPOCH_MILLISECONDS)
  when(currentDateEpochSeconds).mockReturnValue(TEST_EPOCH_SECONDS)
  const basicRecordExpectation: PutItemCommandInput = {
    TableName: TEST_FRAUD_TABLE,
    Item: {
      ttl: {
        N: (TEST_EPOCH_SECONDS + TEST_DATABASE_TTL_HOURS * 60 * 60).toString()
      },
      downloadHash: { S: DOWNLOAD_HASH },
      downloadsRemaining: { N: '2' },
      s3ResultsBucket: { S: TEST_QUERY_RESULTS_BUCKET_NAME },
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
