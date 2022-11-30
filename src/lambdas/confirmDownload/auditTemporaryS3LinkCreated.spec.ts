import { sendSqsMessage } from '../../sharedServices/queue/sendSqsMessage'
import { currentDateEpochSeconds } from '../../utils/currentDateEpoch'
import {
  TEST_AUDIT_DATA_REQUEST_EVENTS_QUEUE_URL,
  TEST_CURRENT_TIME_EPOCH_SECONDS,
  TEST_ZENDESK_TICKET_ID
} from '../../utils/tests/setup/testConstants'
import { auditTemporaryS3LinkCreated } from './auditTemporaryS3LinkCreated'
import { when } from 'jest-when'

jest.mock('../../sharedServices/queue/sendSqsMessage', () => ({
  sendSqsMessage: jest.fn()
}))

jest.mock('../../utils/currentDateEpoch', () => ({
  currentDateEpochSeconds: jest.fn()
}))

describe('auditTemporaryS3LinkCreated', () => {
  beforeEach(() => {
    jest.spyOn(global.console, 'error')
  })

  when(currentDateEpochSeconds).mockReturnValue(TEST_CURRENT_TIME_EPOCH_SECONDS)

  it('should send an audit message in the right format', async () => {
    await auditTemporaryS3LinkCreated(TEST_ZENDESK_TICKET_ID)
    expect(sendSqsMessage).toHaveBeenCalledWith(
      {
        timestamp: TEST_CURRENT_TIME_EPOCH_SECONDS,
        event_name: 'TXMA_AUDIT_QUERY_OUTPUT_ACCESSED',
        component_id: 'TXMA',
        extensions: {
          ticket_details: {
            zendeskId: TEST_ZENDESK_TICKET_ID
          }
        }
      },
      TEST_AUDIT_DATA_REQUEST_EVENTS_QUEUE_URL
    )
  })

  it('should trap and log any errors', async () => {
    const errorMessage = 'error sending message to queue'
    const testError = new Error(errorMessage)
    when(sendSqsMessage).mockRejectedValue(testError)
    await auditTemporaryS3LinkCreated(TEST_ZENDESK_TICKET_ID)

    expect(console.error).toHaveBeenCalledWith(
      'Error sending audit message. This error has not disrupted any user flow',
      testError
    )
  })
})
