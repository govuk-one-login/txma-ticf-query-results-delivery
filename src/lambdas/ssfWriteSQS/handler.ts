import { Context } from 'aws-lambda'
import { sendSqsMessage } from '../../sharedServices/queue/sendSqsMessage'
import { initialiseLogger, logger } from '../../sharedServices/logger'
import { getDataFromQueueTable } from '../../sharedServices/dynamoDb/ssfQueueTable'

export const handler = async (
  payload: { userId: string },
  context: Context
) => {
  initialiseLogger(context)
  console.log(payload)

  const data = await getDataFromQueueTable(payload.userId)

  if (!data || !data.queueUrl) {
    logger.info('no data')
    return
  }

  const queueUrl = data.queueUrl
  const message = {
    message: 'hello'
  }

  await sendSqsMessage(message, queueUrl)
}
