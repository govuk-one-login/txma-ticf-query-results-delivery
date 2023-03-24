import { Context } from 'aws-lambda'
import { sendSqsMessage } from '../../sharedServices/queue/sendSqsMessage'
import { initialiseLogger, logger } from '../../sharedServices/logger'
import { getDataFromQueueTable } from '../../sharedServices/dynamoDb/ssfQueueTable'
import { tryParseJSON } from '../../utils/tryParseJson'

export const handler = async (payload: string, context: Context) => {
  initialiseLogger(context)
  console.log(payload)
  const receivedObject = tryParseJSON(payload)
  logger.info(receivedObject)
  const data = await getDataFromQueueTable(receivedObject.userId)

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
