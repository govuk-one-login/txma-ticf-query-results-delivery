import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  GetItemOutput
} from '@aws-sdk/client-dynamodb'
import { mockClient } from 'aws-sdk-client-mock'
import {
  DOWNLOAD_HASH,
  TEST_S3_OBJECT_ARN
} from '../../utils/tests/setup/testConstants'
import { getSecureDownloadRecord } from './getSecureDownloadRecord'

const dynamoMock = mockClient(DynamoDBClient)

describe('dynamoDBGet', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Returns result if value found in database', async () => {
    const mockDbContents = {
      Item: {
        downloadHash: { S: DOWNLOAD_HASH },
        downloadsRemaining: { N: '3' },
        s3ResultsArn: { S: TEST_S3_OBJECT_ARN }
      }
    }
    dynamoMock.on(GetItemCommand).resolves(mockDbContents as GetItemOutput)
    const result = await getSecureDownloadRecord(DOWNLOAD_HASH)
    expect(result).toEqual({
      downloadHash: DOWNLOAD_HASH,
      downloadsRemaining: 3,
      s3ResultsArn: TEST_S3_OBJECT_ARN
    })
  })

  it('Returns null if nothing found for hash', async () => {
    dynamoMock.on(GetItemCommand).resolves(null)

    const result = await getSecureDownloadRecord(DOWNLOAD_HASH)
    expect(result).toBe(null)
  })

  it('throws error when download record is malformed', async () => {
    const mockDbContents = {
      Item: {
        someProperty: { S: 'someValue' }
      }
    } as GetItemOutput

    dynamoMock.on(GetItemCommand).resolves(mockDbContents)

    await expect(getSecureDownloadRecord(DOWNLOAD_HASH)).rejects.toThrow(
      'Secure download data returned from db was not of correct type'
    )
  })

  it.each(['downloadHash', 'downloadsRemaining', 's3ResultsArn'])(
    'Finds download record id but property %p missing',
    async (propertyName: string) => {
      const mockDbContents = {
        Item: {
          downloadHash: { S: DOWNLOAD_HASH },
          downloadsRemaining: { N: '3' },
          s3ResultsArn: { S: TEST_S3_OBJECT_ARN }
        }
      } as GetItemOutput
      delete (mockDbContents.Item as Record<string, AttributeValue>)[
        propertyName
      ]

      dynamoMock.on(GetItemCommand).resolves(mockDbContents)

      await expect(getSecureDownloadRecord(DOWNLOAD_HASH)).rejects.toThrow(
        'Secure download data returned from db was not of correct type'
      )
    }
  )
})
