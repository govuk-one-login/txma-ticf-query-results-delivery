import { notifyCopy } from '../../constants/notifyCopy'
import { logger } from '../../sharedServices/logger'
import { sendSqsMessage } from '../../sharedServices/queue/sendSqsMessage'
import { getEnv } from '../../utils/getEnv'
import { interpolateTemplate } from '../../utils/interpolateTemplate'

export const sendMessageToCloseTicketQueue = async (
  zendeskId: string,
  commentCopyReference: string
) => {
  const messageId = await sendSqsMessage(
    {
      zendeskId,
      commentCopyText: interpolateTemplate(commentCopyReference, notifyCopy)
    },
    getEnv('CLOSE_TICKET_QUEUE_URL')
  )
  logger.info('Finished sending message to close ticket queue', { messageId })
}
