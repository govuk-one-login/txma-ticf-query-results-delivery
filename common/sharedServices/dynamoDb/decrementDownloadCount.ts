import { ddbClient } from '../../utils/awsSdkClients'
import { getEnv } from '../../utils/getEnv'
import { UpdateItemCommand } from '@aws-sdk/client-dynamodb'

export const decrementDownloadCount = async (downloadHash: string) => {
  const params = {
    TableName: getEnv('SECURE_DOWNLOAD_TABLE_NAME'),
    Key: { downloadHash: { S: downloadHash } },
    UpdateExpression: `ADD downloadsRemaining :increment`,
    ExpressionAttributeValues: {
      ':increment': { N: '-1' }
    }
  }
  await ddbClient.send(new UpdateItemCommand(params))
}
