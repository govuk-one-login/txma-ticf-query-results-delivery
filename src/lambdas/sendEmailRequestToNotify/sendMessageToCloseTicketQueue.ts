import { notifyCopy } from '../../../common/constants/notifyCopy'
import { logger } from '../../../common/sharedServices/logger'
import { sendSqsMessage } from '../../../common/sharedServices/queue/sendSqsMessage'
import { getEnv } from '../../../common/utils/getEnv'
import { interpolateTemplate } from '../../../common/utils/interpolateTemplate'

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
