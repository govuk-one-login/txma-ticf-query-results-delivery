import { handler } from './handler'
import { constructSqsEvent } from '../../utils/tests/constructSqsEvent'
import { writeOutSecureDownloadRecord } from './writeOutSecureDownloadRecord'
import { generateSecureDownloadHash } from './generateSecureDownloadHash'
import { copyDataFromAthenaOutputBucket } from './copyDataFromAthenaOutputBucket'
import { queueSendResultsReadyEmail } from './queueSendResultsReadyEmail'
import { when } from 'jest-when'
import {
  DOWNLOAD_HASH,
  TEST_ATHENA_QUERY_ID,
  TEST_RECIPIENT_EMAIL,
  TEST_RECIPIENT_NAME,
  TEST_ZENDESK_TICKET_ID
} from '../../utils/tests/setup/testConstants'
import { mockLambdaContext } from '../../utils/tests/mocks/mockLambdaContext'

jest.mock('./writeOutSecureDownloadRecord', () => ({
  writeOutSecureDownloadRecord: jest.fn()
}))

jest.mock('./generateSecureDownloadHash', () => ({
  generateSecureDownloadHash: jest.fn()
}))

jest.mock('./copyDataFromAthenaOutputBucket', () => ({
  copyDataFromAthenaOutputBucket: jest.fn()
}))

jest.mock('./queueSendResultsReadyEmail', () => ({
  queueSendResultsReadyEmail: jest.fn()
}))

describe('generateDownload', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    when(generateSecureDownloadHash).mockReturnValue(DOWNLOAD_HASH)
  })

  it('should handle a query complete event', async () => {
    await handler(
      constructSqsEvent(
        JSON.stringify({
          athenaQueryId: TEST_ATHENA_QUERY_ID,
          recipientEmail: TEST_RECIPIENT_EMAIL,
          recipientName: TEST_RECIPIENT_NAME,
          zendeskTicketId: TEST_ZENDESK_TICKET_ID
        })
      ),
      mockLambdaContext
    )
    expect(copyDataFromAthenaOutputBucket).toHaveBeenCalledWith(
      TEST_ATHENA_QUERY_ID
    )

    expect(writeOutSecureDownloadRecord).toHaveBeenCalledWith({
      athenaQueryId: TEST_ATHENA_QUERY_ID,
      downloadHash: DOWNLOAD_HASH,
      zendeskId: TEST_ZENDESK_TICKET_ID
    })
    expect(generateSecureDownloadHash).toHaveBeenCalled()
    expect(queueSendResultsReadyEmail).toHaveBeenCalledWith({
      downloadHash: DOWNLOAD_HASH,
      zendeskTicketId: TEST_ZENDESK_TICKET_ID,
      recipientEmail: TEST_RECIPIENT_EMAIL,
      recipientName: TEST_RECIPIENT_NAME
    })
  })

  it('should throw an appropriate error if there is no data in the event', async () => {
    await expect(handler({ Records: [] }, mockLambdaContext)).rejects.toThrow(
      'No data in event'
    )
  })

  it('should throw an appropriate error if the request includes data of the wrong shape', async () => {
    const initiateDataRequestEvent = constructSqsEvent(
      JSON.stringify({ someProperty: 'someValue' })
    )
    await expect(
      handler(initiateDataRequestEvent, mockLambdaContext)
    ).rejects.toThrow('Event data was not of the correct type')
  })

  it('should throw an appropriate error if the request includes non-JSON data', async () => {
    const initiateDataRequestEvent = constructSqsEvent('some message')
    await expect(
      handler(initiateDataRequestEvent, mockLambdaContext)
    ).rejects.toThrow('Event data did not include a valid JSON body')
  })
})
