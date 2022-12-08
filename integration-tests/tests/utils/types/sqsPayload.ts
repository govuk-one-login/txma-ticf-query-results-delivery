export type TriggerEndOfFlowSQSPayload = {
  message: MessageDetail
  queueUrl: string
}

type MessageDetail = {
  fileName: string
  fileContents: string
}
