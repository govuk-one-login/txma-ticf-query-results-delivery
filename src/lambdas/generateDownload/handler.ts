import { Context, SQSEvent } from 'aws-lambda'
import { isQueryCompleteMessage } from '../../../common/types/queryCompleteMessage'
import { isEmpty } from '../../../common/utils/isEmpty'
import { tryParseJSON } from '../../../common/utils/tryParseJson'
import { copyDataFromAthenaOutputBucket } from './copyDataFromAthenaOutputBucket'
import { generateSecureDownloadHash } from './generateSecureDownloadHash'
import { queueSendResultsReadyEmail } from './queueSendResultsReadyEmail'
import { writeOutSecureDownloadRecord } from './writeOutSecureDownloadRecord'
import {
  appendCorrelationId,
  appendZendeskIdToLogger,
  initialiseLogger,
  logger,
  normaliseError
} from '../../../common/sharedServices/logger'
import { TQRD_GENERATE_01 } from '../../../common/constants/errorCodes'

export const handler = async (event: SQSEvent, context: Context) => {
  initialiseLogger(context)
  const startTime = Date.now()
  const correlationId = event.Records[0]?.messageId ?? context.awsRequestId
  appendCorrelationId(correlationId)

  logger.info('Handler started', {
    handlerName: 'generateDownload',
    recordCount: event.Records.length
  })

  try {
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

    logger.info('Handler completed', {
      handlerName: 'generateDownload',
      outcome: 'success',
      duration: Date.now() - startTime
    })

    return {}
  } catch (err) {
    logger.error('Handler failed', {
      errorCode: TQRD_GENERATE_01,
      handlerName: 'generateDownload',
      outcome: 'failure',
      duration: Date.now() - startTime,
      error: normaliseError(err)
    })
    throw err
  }
}
