import { sendSqsMessage } from '../../sharedServices/queue/sendSqsMessage'
import { currentDateEpochMilliseconds } from '../../utils/currentDateEpochMilliseconds'
import { getEnv } from '../../utils/getEnv'

export const auditTemporaryS3LinkCreated = async (zendeskId: string) => {
  try {
    await sendSqsMessage(
      {
        timestamp: currentDateEpochMilliseconds(),
        event_name: 'TXMA_AUDIT_QUERY_OUTPUT_ACCESSED',
        component_id: 'TXMA',
        extensions: {
          ticket_details: {
            zendeskId: zendeskId
          }
        }
      },
      getEnv('AUDIT_DATA_REQUEST_EVENTS_QUEUE_URL')
    )
  } catch (err) {
    console.error(
      'Error sending audit message. This error has not disrupted any user flow',
      err
    )
  }
}
