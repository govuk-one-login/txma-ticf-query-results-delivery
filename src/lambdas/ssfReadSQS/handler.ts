import { Context } from 'aws-lambda'
import { initialiseLogger, logger } from '../../sharedServices/logger'
import { getDataFromQueueTable } from '../../sharedServices/dynamoDb/ssfQueueTable'
import {
  readSqsMessages,
  deleteSqsMessage
} from '../../sharedServices/queue/readSqsMessage'
import { sendSsfSqsMessageWithStringBody } from '../../sharedServices/queue/sendSqsMessage'

export const handler = async (
  payload: { userId: string; acknowledgements?: string[] },
  context: Context
) => {
  initialiseLogger(context)

  const data = await getDataFromQueueTable(payload.userId)

  if (!data || !data.queueUrl) {
    logger.info('no data')
    return
  }

  if (!data.sentQueueUrl) {
    logger.info('no sent queue url')
    return
  }

  const queueUrl = data.queueUrl
  const sentQueueUrl = data.sentQueueUrl

  // if (payload.acknowledgements) {
  //   const acknowledgements = payload.acknowledgements
  //   acknowledgements.forEach(acknowledgement => deleteSqsMessage(sentQueueUrl, acknowledgement))
  // }

  const messages = await readSqsMessages(queueUrl)

  if (messages?.length) {
    for (let i = 0; i < messages.length; i++) {
      const { Body, MessageId, ReceiptHandle } = messages[i]
      console.log(`processing ${Body}`)
      if (MessageId) {
        await sendSsfSqsMessageWithStringBody(Body, sentQueueUrl, MessageId)
      }
      if (ReceiptHandle) {
        console.log(` this is the receiptHandle ${ReceiptHandle}`)
        await deleteSqsMessage(queueUrl, ReceiptHandle)
      }
      // console.log('now go check the queue to see if it deleted')
    }
  }
}
