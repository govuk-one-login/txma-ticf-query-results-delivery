import { Context, SQSEvent } from 'aws-lambda'
import { sendEmailToNotify } from './sendEmailToNotify'
import { PersonalisationOptions } from '../../../common/types/notify/personalisationOptions'
import { tryParseJSON } from '../../../common/utils/tryParseJson'
import { interpolateTemplate } from '../../../common/utils/interpolateTemplate'
import { notifyCopy } from '../../../common/constants/notifyCopy'
import { NotifyError } from '../../../common/types/notify/notifyError'
import { sendMessageToCloseTicketQueue } from './sendMessageToCloseTicketQueue'
import {
  appendCorrelationId,
  appendZendeskIdToLogger,
  initialiseLogger,
  logger,
  normaliseError
} from '../../../common/sharedServices/logger'
import { TQRD_EMAIL_01 } from '../../../common/constants/errorCodes'

export const handler = async (event: SQSEvent, context: Context) => {
  initialiseLogger(context)
  const startTime = Date.now()
  const correlationId = event.Records[0]?.messageId ?? context.awsRequestId
  appendCorrelationId(correlationId)

  logger.info('Handler started', {
    handlerName: 'sendEmailRequestToNotify',
    recordCount: event.Records.length
  })

  const requestDetails = parseRequestDetails(event)
  appendZendeskIdToLogger(requestDetails.zendeskId)

  try {
    if (isEventBodyInvalid(requestDetails)) {
      throw Error(interpolateTemplate('requiredDetailsMissing', notifyCopy))
    }
    await sendEmailToNotify(requestDetails)
  } catch (error) {
    const notifyErrorDetail = formatNotifyErrors(error)
    logger.error('Could not send a request to Notify', {
      errorCode: TQRD_EMAIL_01,
      handlerName: 'sendEmailRequestToNotify',
      outcome: 'failure',
      duration: Date.now() - startTime,
      notifyError: notifyErrorDetail || undefined,
      error: normaliseError(error)
    })
    await sendMessageToCloseTicketQueue(
      requestDetails.zendeskId,
      'resultNotEmailed'
    )
    throw error
  }

  await sendMessageToCloseTicketQueue(requestDetails.zendeskId, 'linkToResults')

  logger.info('Handler completed', {
    handlerName: 'sendEmailRequestToNotify',
    outcome: 'success',
    duration: Date.now() - startTime
  })
}

const formatNotifyErrors = (error: unknown): string => {
  const notifyError = error as NotifyError
  const firstNotifyError = notifyError?.response?.data?.errors[0]
  if (firstNotifyError) {
    return firstNotifyError
  }

  return ''
}

const parseRequestDetails = (event: SQSEvent) => {
  if (!event.Records.length) {
    throw Error('No records found in event')
  }

  const eventBody = event.Records[0].body
  if (!eventBody) {
    throw Error(interpolateTemplate('missingEventBody', notifyCopy))
  }

  const requestDetails: PersonalisationOptions = tryParseJSON(eventBody)
  if (!requestDetails.zendeskId) {
    throw Error(interpolateTemplate('zendeskTicketIdMissing', notifyCopy))
  }

  return requestDetails
}

const isEventBodyInvalid = (requestDetails: PersonalisationOptions) => {
  return !(
    requestDetails.firstName &&
    requestDetails.zendeskId &&
    requestDetails.secureDownloadUrl &&
    requestDetails.email
  )
}
