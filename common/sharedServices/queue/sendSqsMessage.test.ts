import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'
import {
  sendSqsMessage,
  sendSqsMessageWithStringBody
} from '../../../common/sharedServices/queue/sendSqsMessage'
import { testSqsMessageBody } from '../../../common/utils/tests/setup/testSqsMessageBody'
import { mockClient } from 'aws-sdk-client-mock'
import 'aws-sdk-client-mock-jest'

const sqsMock = mockClient(SQSClient)

const MOCK_QUEUE_URL = 'http://my_queue_url'
const MOCK_MESSAGE_ID = 'MyMessageId'
describe('sendSqsMessage', () => {
  it('sends message to correct queue', async () => {
    sqsMock.on(SendMessageCommand).resolves({ MessageId: MOCK_MESSAGE_ID })

    const messageId = await sendSqsMessage(testSqsMessageBody, MOCK_QUEUE_URL)
    expect(messageId).toEqual(MOCK_MESSAGE_ID)
    expect(sqsMock).toHaveReceivedCommandWith(SendMessageCommand, {
      QueueUrl: MOCK_QUEUE_URL,
      MessageBody: JSON.stringify(testSqsMessageBody)
    })
  })

  it('sets delaySend when set in parameters', async () => {
    sqsMock.on(SendMessageCommand).resolves({ MessageId: MOCK_MESSAGE_ID })
    const delaySendInSeconds = 60
    const messageId = await sendSqsMessage(
      testSqsMessageBody,
      MOCK_QUEUE_URL,
      delaySendInSeconds
    )
    expect(messageId).toEqual(MOCK_MESSAGE_ID)
    expect(sqsMock).toHaveReceivedCommandWith(SendMessageCommand, {
      QueueUrl: MOCK_QUEUE_URL,
      MessageBody: JSON.stringify(testSqsMessageBody),
      DelaySeconds: delaySendInSeconds
    })
  })
})

describe('sendSqsMessageWithStringBody', () => {
  it('sends message string to correct queue', async () => {
    sqsMock.on(SendMessageCommand).resolves({ MessageId: MOCK_MESSAGE_ID })
    const messageBody = 'myMessageBody'
    const messageId = await sendSqsMessageWithStringBody(
      messageBody,
      MOCK_QUEUE_URL
    )
    expect(messageId).toEqual(MOCK_MESSAGE_ID)
    expect(sqsMock).toHaveReceivedCommandWith(SendMessageCommand, {
      QueueUrl: MOCK_QUEUE_URL,
      MessageBody: messageBody
    })
  })
})
