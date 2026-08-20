import { sendSqsMessage } from '../../../common/sharedServices/queue/sendSqsMessage'
import { currentDateEpochSeconds } from '../../../common/utils/currentDateEpoch'
import {
  TEST_AUDIT_DATA_REQUEST_EVENTS_QUEUE_URL,
  TEST_CURRENT_TIME_EPOCH_SECONDS,
  TEST_ZENDESK_TICKET_ID
} from '../../../common/utils/tests/setup/testConstants'
import { auditTemporaryS3LinkCreated } from './auditTemporaryS3LinkCreated'
import { logger } from '../../../common/sharedServices/logger'
import { TQRD_AUDIT_01 } from '../../../common/constants/errorCodes'

vi.mock('../../../common/sharedServices/queue/sendSqsMessage', () => ({
  sendSqsMessage: vi.fn()
}))

vi.mock('../../../common/utils/currentDateEpoch', () => ({
  currentDateEpochSeconds: vi.fn()
}))

describe('auditTemporaryS3LinkCreated', () => {
  beforeEach(() => {
    vi.spyOn(logger, 'error')
  })

  vi.mocked(currentDateEpochSeconds).mockReturnValue(
    TEST_CURRENT_TIME_EPOCH_SECONDS
  )

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
    const testError = new Error(
      'Error sending audit message. This error has not disrupted any user flow'
    )
    vi.mocked(sendSqsMessage).mockRejectedValue(testError)
    await auditTemporaryS3LinkCreated(TEST_ZENDESK_TICKET_ID)

    expect(logger.error).toHaveBeenCalledWith(
      'Error sending audit message. This error has not disrupted any user flow',
      {
        errorCode: TQRD_AUDIT_01,
        error: {
          message: testError.message,
          name: testError.name,
          stack: testError.stack
        }
      }
    )
  })
})
