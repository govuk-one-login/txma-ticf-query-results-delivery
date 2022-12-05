export type CreateResultFileSQSPayload = {
  message: string
  queueUrl: string
}

export type QueryCompleteSQSPayload = {
  message: SQSMessage
  queueUrl: string
}

export type SQSMessage = {
  athenaQueryId: string
  recipientEmail: string
  recipientName: string
  zendeskTicketId: string
}
