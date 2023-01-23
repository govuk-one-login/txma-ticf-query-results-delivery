import { sendSqsMessage } from '../../sharedServices/queue/sendSqsMessage'
import { currentDateEpochSeconds } from '../../utils/currentDateEpoch'
import { getEnv } from '../../utils/getEnv'
import { logger } from '../../sharedServices/logger'
export const auditTemporaryS3LinkCreated = async (
  zendeskIdInternal: string
) => {
  try {
    logger.appendKeys({ zendeskId: zendeskIdInternal })
    await sendSqsMessage(
      {
        timestamp: currentDateEpochSeconds(),
        event_name: 'TXMA_AUDIT_QUERY_OUTPUT_ACCESSED',
        component_id: 'TXMA',
        extensions: {
          ticket_details: {
            zendeskId: zendeskIdInternal
          }
        }
      },
      getEnv('AUDIT_DATA_REQUEST_EVENTS_QUEUE_URL')
    )
  } catch (err) {
    logger.error(
      'Error sending audit message. This error has not disrupted any user flow',
      err as Error
    )
  }
}
