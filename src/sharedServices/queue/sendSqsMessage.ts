import {
  SQSClient,
  SendMessageRequest,
  SendMessageCommand
} from '@aws-sdk/client-sqs'
import { getEnv } from '../../utils/getEnv'

export const sendSqsMessage = async (
  messageBody: object,
  queueUrl: string,
  delaySendInSeconds?: number
): Promise<string | undefined> => {
  return sendSqsMessageWithStringBody(
    JSON.stringify(messageBody),
    queueUrl,
    delaySendInSeconds
  )
}

export const sendSqsMessageWithStringBody = async (
  messageBody: string,
  queueUrl: string,
  delaySendInSeconds?: number
): Promise<string | undefined> => {
  const client = new SQSClient({ region: getEnv('AWS_REGION') })
  const message: SendMessageRequest = {
    QueueUrl: queueUrl,
    MessageBody: messageBody,
    MessageGroupId: 'ssfTest'
  }
  if (delaySendInSeconds) {
    message.DelaySeconds = delaySendInSeconds
  }
  const result = await client.send(new SendMessageCommand(message))
  return result.MessageId
}

export const sendSsfSqsMessage = async (
  messageBody: object,
  queueUrl: string,
  messageGroupId: string
): Promise<string | undefined> => {
  return sendSsfSqsMessageWithStringBody(
    JSON.stringify(messageBody),
    queueUrl,
    messageGroupId
  )
}

export const sendSsfSqsMessageWithStringBody = async (
  messageBody: string,
  queueUrl: string,
  messageGroupId: string
): Promise<string | undefined> => {
  const client = new SQSClient({ region: getEnv('AWS_REGION') })
  const message: SendMessageRequest = {
    QueueUrl: queueUrl,
    MessageBody: messageBody,
    MessageGroupId: messageGroupId
  }
  const result = await client.send(new SendMessageCommand(message))
  return result.MessageId
}
