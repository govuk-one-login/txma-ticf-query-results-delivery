import { sendMessageToCloseTicketQueue } from './sendMessageToCloseTicketQueue'
import { sendSqsMessage } from '../../../common/sharedServices/queue/sendSqsMessage'
import { logger } from '../../../common/sharedServices/logger'
import {
  TEST_CLOSE_TICKET_QUEUE_URL,
  TEST_ZENDESK_TICKET_ID
} from '../../../common/utils/tests/setup/testConstants'

jest.mock('../../../common/sharedServices/queue/sendSqsMessage', () => ({
  sendSqsMessage: jest.fn()
}))

const mockSendSqsMessage = sendSqsMessage as jest.Mock
const TEST_MESSAGE_ID = 'test-message-id-12345'

describe('sendMessageToCloseTicketQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(logger, 'info')
  })

  it('should send message to close ticket queue with correct parameters for linkToResults', async () => {
    mockSendSqsMessage.mockResolvedValue(TEST_MESSAGE_ID)

    await sendMessageToCloseTicketQueue(TEST_ZENDESK_TICKET_ID, 'linkToResults')

    expect(sendSqsMessage).toHaveBeenCalledWith(
      {
        zendeskId: TEST_ZENDESK_TICKET_ID,
        commentCopyText: 'A link to your results has been sent to you.'
      },
      TEST_CLOSE_TICKET_QUEUE_URL
    )

    expect(logger.info).toHaveBeenCalledWith(
      'Finished sending message to close ticket queue',
      { messageId: TEST_MESSAGE_ID }
    )
  })
})
