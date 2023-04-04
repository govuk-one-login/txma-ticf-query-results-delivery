import { ddbClient } from './dynamoDbClient'
import { getEnv } from '../../utils/getEnv'
import { PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb'
import { logger } from '../logger'

export const writeToQueueTable = async (
  userId: string,
  queueUrl: string,
  queueArn: string,
  sentQueueUrl: string
) => {
  const params = {
    TableName: getEnv('SSF_QUEUE_ARN_TABLE_NAME'),
    Item: {
      userId: { S: userId },
      queueUrl: { S: queueUrl },
      queueArn: { S: queueArn },
      sentQueueUrl: { S: sentQueueUrl }
    }
  }
  const result = await ddbClient.send(new PutItemCommand(params))

  if (result.$metadata) logger.info('did some db stuff')
}

export const getDataFromQueueTable = async (userId: string) => {
  const params = {
    TableName: getEnv('SSF_QUEUE_ARN_TABLE_NAME'),
    Key: { userId: { S: userId } }
  }

  const data = await ddbClient.send(new GetItemCommand(params))
  if (!data || !data.Item) {
    logger.info('no data!')
    return null
  }
  const responseObject = data.Item

  const record = {
    userId: responseObject?.userId?.S,
    queueUrl: responseObject?.queueUrl?.S,
    queueArn: responseObject?.queueArn?.S,
    sentQueueUrl: responseObject?.sentQueueUrl?.S
  }

  return record
}
