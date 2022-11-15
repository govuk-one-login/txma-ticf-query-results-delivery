import { sendSqsMessage } from '../../sharedServices/queue/sendSqsMessage'
import { getEnv } from '../../utils/getEnv'
export const queueSendResultsReadyEmail = async (parameters: {
  downloadHash: string
  zendeskTicketId: string
  recipientEmail: string
  recipientName: string
}) => {
  await sendSqsMessage(
    {
      firstName: parameters.recipientName,
      zendeskId: parameters.zendeskTicketId,
      secureDownloadUrl: `${getEnv('SECURE_DOWNLOAD_LINK_BASE_URL')}/${
        parameters.downloadHash
      }`,
      email: parameters.recipientEmail
    },
    getEnv('SEND_TO_EMAIL_QUEUE_URL')
  )
}
