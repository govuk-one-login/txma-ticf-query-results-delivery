import { Context, SQSEvent } from 'aws-lambda'
import { isQueryCompleteMessage } from '../../types/queryCompleteMessage'
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

  appendZendeskIdToLogger(eventData.zendeskTicketId)

  const downloadHash = generateSecureDownloadHash()
  await copyDataFromAthenaOutputBucket(eventData.athenaQueryId)
  logger.info('Finished copying data from Athena output bucket')

  await writeOutSecureDownloadRecord({
    athenaQueryId: eventData.athenaQueryId,
    downloadHash: downloadHash,
    zendeskId: eventData.zendeskTicketId
  })
  logger.info('Finished writing out secure download record')

  await queueSendResultsReadyEmail({
    downloadHash: downloadHash,
    zendeskTicketId: eventData.zendeskTicketId,
    recipientEmail: eventData.recipientEmail,
    recipientName: eventData.recipientName
  })

  return {}
}
