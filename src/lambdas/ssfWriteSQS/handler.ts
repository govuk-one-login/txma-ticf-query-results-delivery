import { Context } from 'aws-lambda'
import { sendSsfSqsMessage } from '../../sharedServices/queue/sendSqsMessage'
import { initialiseLogger, logger } from '../../sharedServices/logger'
import { getDataFromQueueTable } from '../../sharedServices/dynamoDb/ssfQueueTable'

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
  // const message = {
  //   message: 'hello'
  // }

  for (let i = 1; i <= 21; i++) {
    const messageGroupId = `Group${i}`
    const message = {
      message: `this is message ${i}`
    }
    await sendSsfSqsMessage(message, queueUrl, messageGroupId)
  }

  // await sendSqsMessage(message, queueUrl)
}
