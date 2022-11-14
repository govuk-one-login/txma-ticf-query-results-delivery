import { notifyCopy } from '../../constants/notifyCopy'
import { sendSqsMessage } from '../../sharedServices/queue/sendSqsMessage'
import { getEnv } from '../../utils/getEnv'
import { interpolateTemplate } from '../../utils/interpolateTemplate'

export const sendMessageToCloseTicketQueue = async (
  zendeskId: string,
  commentCopyReference: string
) => {
  console.log(
    `Sending message to close ticket queue for Zendesk ID ${zendeskId}`
  )
  const closeTicketMessageId = await sendSqsMessage(
    {
      zendeskId,
      commentCopyText: interpolateTemplate(commentCopyReference, notifyCopy)
    },
    getEnv('CLOSE_TICKET_QUEUE_URL')
  )
  console.log(
    `Finished sending message to close ticket queue for Zendesk ID ${zendeskId}. Message id ${closeTicketMessageId}`
  )
}
