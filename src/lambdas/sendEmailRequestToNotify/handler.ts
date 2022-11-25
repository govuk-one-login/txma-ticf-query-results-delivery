import { SQSEvent } from 'aws-lambda'
import { sendEmailToNotify } from './sendEmailToNotify'
import { PersonalisationOptions } from '../../types/notify/personalisationOptions'
import { tryParseJSON } from '../../utils/tryParseJson'
import { interpolateTemplate } from '../../utils/interpolateTemplate'
import { notifyCopy } from '../../constants/notifyCopy'
import { NotifyError } from '../../types/notify/notifyError'
import { sendMessageToCloseTicketQueue } from './sendMessageToCloseTicketQueue'

export const handler = async (event: SQSEvent) => {
  console.log('received event', JSON.stringify(event, null, 2))
  const requestDetails = parseRequestDetails(event)
  try {
    if (isEventBodyInvalid(requestDetails)) {
      throw Error(interpolateTemplate('requiredDetailsMissing', notifyCopy))
    }
    await sendEmailToNotify(requestDetails)
  } catch (error) {
    console.error(
      `${interpolateTemplate(
        'requestNotSentToNotify',
        notifyCopy
      )}${formatNotifyErrors(error)}`,
      error
    )
    await sendMessageToCloseTicketQueue(
      requestDetails.zendeskId,
      'resultNotEmailed'
    )
    throw error
  }

  await sendMessageToCloseTicketQueue(requestDetails.zendeskId, 'linkToResults')
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
