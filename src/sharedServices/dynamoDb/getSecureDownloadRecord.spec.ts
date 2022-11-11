import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  GetItemOutput
} from '@aws-sdk/client-dynamodb'
import {
  DOWNLOAD_HASH,
  TEST_QUERY_RESULTS_BUCKET_NAME,
  TEST_S3_OBJECT_KEY,
  TEST_CREATED_DATE
} from '../../utils/tests/setup/testConstants'
import { getSecureDownloadRecord } from './getSecureDownloadRecord'
import { mockClient } from 'aws-sdk-client-mock'
import 'aws-sdk-client-mock-jest'

const dynamoMock = mockClient(DynamoDBClient)

describe('dynamoDBGet', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  const mockDbContents = {
    Item: {
      downloadHash: { S: DOWNLOAD_HASH },
      downloadsRemaining: { N: '3' },
      s3ResultsBucket: { S: TEST_QUERY_RESULTS_BUCKET_NAME },
      s3ResultsKey: { S: TEST_S3_OBJECT_KEY },
      createdDate: { N: TEST_CREATED_DATE.toString() }
    }
  }

  it('Returns result if value found in database', async () => {
    dynamoMock.on(GetItemCommand).resolves(mockDbContents as GetItemOutput)
    const result = await getSecureDownloadRecord(DOWNLOAD_HASH)
    expect(result).toEqual({
      downloadHash: DOWNLOAD_HASH,
      downloadsRemaining: 3,
      s3ResultsBucket: TEST_QUERY_RESULTS_BUCKET_NAME,
      s3ResultsKey: TEST_S3_OBJECT_KEY,
      createdDate: TEST_CREATED_DATE
    })
  })

  it('Returns null if nothing found for hash', async () => {
    dynamoMock.on(GetItemCommand).resolves(null)

    const result = await getSecureDownloadRecord(DOWNLOAD_HASH)
    expect(result).toBe(null)
  })

  it('throws error when download record is malformed', async () => {
    const dbContents = {
      Item: {
        someProperty: { S: 'someValue' }
      }
    } as GetItemOutput

    dynamoMock.on(GetItemCommand).resolves(dbContents)

    await expect(getSecureDownloadRecord(DOWNLOAD_HASH)).rejects.toThrow(
      'Secure download data returned from db was not of correct type'
    )
  })

  it.each(['downloadHash', 'downloadsRemaining', 's3ResultsArn'])(
    'Finds download record id but property %p missing',
    async (propertyName: string) => {
      const testDbContents = { ...mockDbContents } as GetItemOutput
      delete (testDbContents.Item as Record<string, AttributeValue>)[
        propertyName
      ]

      dynamoMock.on(GetItemCommand).resolves(testDbContents)

      await expect(getSecureDownloadRecord(DOWNLOAD_HASH)).rejects.toThrow(
        'Secure download data returned from db was not of correct type'
      )
    }
  )
})
