import { sendSqsMessage } from '../../../common/sharedServices/queue/sendSqsMessage'
import {
  DOWNLOAD_HASH,
  TEST_RECIPIENT_EMAIL,
  TEST_RECIPIENT_NAME,
  TEST_SECURE_DOWNLOAD_LINK_BASE_URL,
  TEST_SEND_TO_EMAIL_QUEUE_URL,
  TEST_ZENDESK_TICKET_ID
} from '../../../common/utils/tests/setup/testConstants'
jest.mock('../../../common/sharedServices/queue/sendSqsMessage', () => ({
  sendSqsMessage: jest.fn()
}))
import { queueSendResultsReadyEmail } from './queueSendResultsReadyEmail'

describe('queueSendResultsReadyEmail', () => {
  it('should send message to email queue with correct attributes', async () => {
    await queueSendResultsReadyEmail({
      downloadHash: DOWNLOAD_HASH,
      zendeskTicketId: TEST_ZENDESK_TICKET_ID,
      recipientEmail: TEST_RECIPIENT_EMAIL,
      recipientName: TEST_RECIPIENT_NAME
    })
    expect(sendSqsMessage).toHaveBeenCalledWith(
      {
        firstName: TEST_RECIPIENT_NAME,
        zendeskId: TEST_ZENDESK_TICKET_ID,
        secureDownloadUrl: `${TEST_SECURE_DOWNLOAD_LINK_BASE_URL}/${DOWNLOAD_HASH}`,
        email: TEST_RECIPIENT_EMAIL
      },
      TEST_SEND_TO_EMAIL_QUEUE_URL
    )
  })
})
