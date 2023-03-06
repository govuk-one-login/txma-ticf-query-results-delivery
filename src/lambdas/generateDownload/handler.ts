import { Context, SQSEvent } from 'aws-lambda'
import {
  isQueryCompleteMessage,
  QueryCompleteMessage
} from '../../types/queryCompleteMessage'
import { isEmpty } from '../../utils/isEmpty'
import { tryParseJSON } from '../../utils/tryParseJson'
import { copyDataFromAthenaOutputBucket } from './copyDataFromAthenaOutputBucket'
import { generateSecureDownloadHash } from './generateSecureDownloadHash'
import { queueSendResultsReadyEmail } from './queueSendResultsReadyEmail'
import { writeOutSecureDownloadRecord } from './writeOutSecureDownloadRecord'
import {
  appendZendeskIdToLogger,
  initialiseLogger,
  logger
} from '../../sharedServices/logger'

export const handler = async (event: SQSEvent, context: Context) => {
  initialiseLogger(context)
  logger.info('Handling query complete SQS event')
  if (event.Records.length === 0) {
    throw new Error('No data in event')
  }
  const eventData = tryParseJSON(event.Records[0].body)
  if (isEmpty(eventData)) {
    throw new Error('Event data did not include a valid JSON body')
  }

  if (!isQueryCompleteMessage(eventData)) {
    throw new Error('Event data was not of the correct type')
  }

  const queryCompleteMessage = eventData as QueryCompleteMessage
  appendZendeskIdToLogger(queryCompleteMessage.zendeskTicketId)

  const downloadHash = generateSecureDownloadHash()
  await copyDataFromAthenaOutputBucket(queryCompleteMessage.athenaQueryId)

  await writeOutSecureDownloadRecord({
    athenaQueryId: queryCompleteMessage.athenaQueryId,
    downloadHash: downloadHash,
    zendeskId: queryCompleteMessage.zendeskTicketId
  })

  await queueSendResultsReadyEmail({
    downloadHash: downloadHash,
    zendeskTicketId: queryCompleteMessage.zendeskTicketId,
    recipientEmail: queryCompleteMessage.recipientEmail,
    recipientName: queryCompleteMessage.recipientName
  })

  return {}
}
