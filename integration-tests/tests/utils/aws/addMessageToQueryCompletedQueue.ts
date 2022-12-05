import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import { getIntegrationTestEnvironmentVariable } from '../getIntegrationTestEnvironmentVariable'

export const addMessageToQueryCompletedQueue = async (message: {
  athenaQueryId: string
  recipientEmail: string
  recipientName: string
  zendeskTicketId: string
}) => {
  const params = {
    MessageBody: JSON.stringify(message),
    QueueUrl: getIntegrationTestEnvironmentVariable('QUERY_COMPLETED_QUEUE_URL')
  }

  const sqsClient = new SQSClient({
    region: getIntegrationTestEnvironmentVariable('AWS_REGION')
  })
  const response = await sqsClient.send(new SendMessageCommand(params))

  expect(response.MessageId).toBeDefined()
}
