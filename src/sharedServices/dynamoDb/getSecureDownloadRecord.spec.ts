import {
  DynamoDBClient,
  GetItemCommand,
  GetItemOutput
} from '@aws-sdk/client-dynamodb'
import { mockClient } from 'aws-sdk-client-mock'
import { DOWNLOAD_HASH, TEST_S3_OBJECT_ARN } from '../../utils/tests/setup/testConstants'
import { getSecureDownloadRecord } from './getSecureDownloadRecord'

const dynamoMock = mockClient(DynamoDBClient)

describe('dynamoDBGet', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Finds valid request query in database', async () => {
    const mockDbContents = {
      Item: {
        downloadRecordId: { S: DOWNLOAD_HASH },
        downloadsRemaining: { N: '3' },
        s3ResultsArn: { S: TEST_S3_OBJECT_ARN}
      }
    }
    dynamoMock.on(GetItemCommand).resolves(mockDbContents as GetItemOutput)

    const result = await getSecureDownloadRecord(DOWNLOAD_HASH)
    expect(result).toEqual({
      downloadRecordId: DOWNLOAD_HASH,
      downloadsRemaining: 3,
      s3ResultsArn: TEST_S3_OBJECT_ARN
    })
  })

  // TODO: check what response is like when record not found
  // it('Does not find request query in database - empty object response', async () => {
  //   dynamoMock.on(GetItemCommand).resolves(null)

  //   await expect(getSecureDownloadRecord(DOWNLOAD_HASH)).toEqual(null)
  // })

  it('Finds Request query but cant turn info into a valid query', async () => {
    const mockDbContents = {
      Item: {
        wrongColumn: { S: '12' }
      }
    }

    dynamoMock.on(GetItemCommand).resolves(mockDbContents)

    await expect(getSecureDownloadRecord(DOWNLOAD_HASH)).rejects.toThrow(
      'Secure download data returned from db was not of correct type'
    )
  })
})
