import {
  SQSClient,
  ReceiveMessageCommandInput,
  ReceiveMessageCommand
} from '@aws-sdk/client-sqs'
import { getEnv } from '../../utils/getEnv'

export const readSqsMessages = async (queueUrl: string) => {
  const client = new SQSClient({ region: getEnv('AWS_REGION') })
  const params: ReceiveMessageCommandInput = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,
    VisibilityTimeout: 60,
    MessageGroupId: 'ssfTest'
  }

  const result = await client.send(new ReceiveMessageCommand(params))
  return result.Messages
}
