export const queueSendResultsReadyEmail = async (parameters: {
  downloadHash: string
  zendeskTicketId: string
  recipientEmail: string
  recipientName: string
}) => {
  console.log('queueing send email event for ', parameters)
}
