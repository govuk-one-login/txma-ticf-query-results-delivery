import { Context } from 'aws-lambda'
import { initialiseLogger, logger } from '../../sharedServices/logger'
import { getDataFromQueueTable } from '../../sharedServices/dynamoDb/ssfQueueTable'
import {
  readSqsMessages,
  deleteSqsMessage
} from '../../sharedServices/queue/readSqsMessage'

export const handler = async (
  payload: { userId: string },
  context: Context
) => {
  initialiseLogger(context)

  const data = await getDataFromQueueTable(payload.userId)

  if (!data || !data.queueUrl) {
    logger.info('no data')
    return
  }

  const queueUrl = data.queueUrl

  const messages = await readSqsMessages(queueUrl)

  if (messages?.length) {
    for (let i = 0; i < messages.length; i++) {
      const { Body, ReceiptHandle } = messages[i]
      console.log(`processing ${Body}, trying to delete it...`)
      if (ReceiptHandle) {
        await deleteSqsMessage(queueUrl, ReceiptHandle)
      }
      console.log('now go check the queue to see if it deleted')
    }
  }
}
