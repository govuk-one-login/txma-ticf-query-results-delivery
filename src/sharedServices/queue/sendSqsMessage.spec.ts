import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'
import { sendSqsMessage } from './sendSqsMessage'
import { mockClient } from 'aws-sdk-client-mock'
import 'aws-sdk-client-mock-jest'

const sqsMock = mockClient(SQSClient)

const MOCK_QUEUE_URL = 'http://my_queue_url'
const MOCK_MESSAGE_ID = 'MyMessageId'
const TEST_MESSAGE_BODY = { my: 'body' }
describe('sendSqsMessage', () => {
  it('sends message to correct queue', async () => {
    sqsMock.on(SendMessageCommand).resolves({ MessageId: MOCK_MESSAGE_ID })

    const messageId = await sendSqsMessage(TEST_MESSAGE_BODY, MOCK_QUEUE_URL)
    expect(messageId).toEqual(MOCK_MESSAGE_ID)
    expect(sqsMock).toHaveReceivedCommandWith(SendMessageCommand, {
      QueueUrl: MOCK_QUEUE_URL,
      MessageBody: JSON.stringify(TEST_MESSAGE_BODY)
    })
  })
})
