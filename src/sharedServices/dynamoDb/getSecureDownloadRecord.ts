import { GetItemCommand } from '@aws-sdk/client-dynamodb'
import {
  isSecureDownloadRecord,
  SecureDownloadRecord
} from '../../types/secureDownloadRecord'
import { getEnv } from '../../utils/getEnv'
import { ddbClient } from './dynamoDbClient'
export const getSecureDownloadRecord = async (
  downloadHash: string
): Promise<SecureDownloadRecord | null> => {
  const params = {
    TableName: getEnv('SECURE_DOWNLOAD_TABLE_NAME'),
    Key: { downloadHash: { S: downloadHash } }
  }

  const data = await ddbClient.send(new GetItemCommand(params))
  if (!data || !data.Item) {
    return null
  }

  const responseObject = data.Item

  const record = {
    downloadHash: responseObject?.downloadHash?.S,
    downloadsRemaining: parseInt(
      responseObject?.downloadsRemaining?.N as string
    ),
    s3ResultsKey: responseObject?.s3ResultsKey?.S,
    s3ResultsBucket: responseObject?.s3ResultsBucket?.S
  }

  if (!isSecureDownloadRecord(record)) {
    throw new Error(
      'Secure download data returned from db was not of correct type'
    )
  }

  return record
}