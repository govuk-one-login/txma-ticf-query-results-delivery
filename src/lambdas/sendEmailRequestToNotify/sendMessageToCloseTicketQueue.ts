// import { notifyCopy } from '../../constants/notifyCopy'
// import { sendSqsMessage } from '../../sharedServices/queue/sendSqsMessage'
// import { getEnv } from '../../utils/getEnv'
// import { interpolateTemplate } from '../../utils/interpolateTemplate'

// export const sendMessageToCloseTicketQueue = async (
//   zendeskId: string,
//   commentCopyReference: string
// ) => {
//   sendSqsMessage(
//     {
//       zendeskId,
//       commentCopyText: interpolateTemplate(commentCopyReference, notifyCopy)
//     },
//     getEnv('CLOSE_TICKET_QUEUE_URL')
//   )
// }
export const sendMessageToCloseTicketQueue = async (
  zendeskId: string,
  commentCopyReference: string
) => {
  console.log(
    'Placeholder for sending message to close ticket queue: ',
    zendeskId,
    commentCopyReference
  )
}
