import {
  SQSClient,
  ReceiveMessageCommandInput,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  DeleteMessageCommandInput
} from '@aws-sdk/client-sqs'
import { getEnv } from '../../utils/getEnv'

export const readSqsMessages = async (queueUrl: string) => {
  const client = new SQSClient({ region: getEnv('AWS_REGION') })
  const params: ReceiveMessageCommandInput = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 4
    // VisibilityTimeout: 60
  }

  const result = await client.send(new ReceiveMessageCommand(params))
  return result.Messages
}

export const deleteSqsMessage = async (
  queueUrl: string,
  receiptHandle: string
) => {
  const client = new SQSClient({ region: getEnv('AWS_REGION') })

  const params: DeleteMessageCommandInput = {
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle
  }

  await client.send(new DeleteMessageCommand(params))
}
