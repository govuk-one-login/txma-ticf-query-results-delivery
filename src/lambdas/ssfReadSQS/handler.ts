import { Context } from 'aws-lambda'
import { initialiseLogger, logger } from '../../sharedServices/logger'
import { getDataFromQueueTable } from '../../sharedServices/dynamoDb/ssfQueueTable'
import { readSqsMessages } from '../../sharedServices/queue/readSqsMessage'

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
      console.log(messages[i].Body)
    }
  }
}
