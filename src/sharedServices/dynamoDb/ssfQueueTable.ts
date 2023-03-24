import { ddbClient } from './dynamoDbClient'
import { getEnv } from '../../utils/getEnv'
import { PutItemCommand } from '@aws-sdk/client-dynamodb'
import { logger } from '../logger'

export const writeToQueueTable = async (
  userId: string,
  queueUrl: string,
  queueArn: string
) => {
  const params = {
    TableName: getEnv('SSF_QUEUE_ARN_TABLE_NAME'),
    Item: {
      userId: { S: userId },
      queueUrl: { S: queueUrl },
      queueArn: { S: queueArn }
    }
  }
  const result = await ddbClient.send(new PutItemCommand(params))

  logger.info(result.$metadata)
}
