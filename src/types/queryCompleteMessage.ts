export interface QueryCompleteMessage {
  athenaQueryId: string
  recipientEmail: string
  recipientName: string
  zendeskTicketId: string
}

export const isQueryCompleteMessage = (
  arg: unknown
): arg is QueryCompleteMessage => {
  const test = arg as QueryCompleteMessage
  return (
    typeof test?.athenaQueryId === 'string' &&
    typeof test?.recipientEmail === 'string' &&
    typeof test?.recipientName === 'string' &&
    typeof test?.zendeskTicketId === 'string'
  )
}
