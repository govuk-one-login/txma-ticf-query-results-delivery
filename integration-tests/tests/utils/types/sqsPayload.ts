export type TriggerEndOfFlowSQSPayload = {
  message: MessageDetail
  queueUrl: string
}

type MessageDetail = {
  athenaQueryId: string
  fileContents: string
  zendeskId: string
}
