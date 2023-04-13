import { defaultApiRequest } from '../../utils/tests/defaultApiRequest'
import { handler } from './handler'
import { getDownloadAvailabilityResult } from '../../sharedServices/getDownloadAvailabilityResult'
import { when } from 'jest-when'
import { logger } from '../../sharedServices/logger'
import {
  DOWNLOAD_HASH,
  TEST_QUERY_RESULTS_BUCKET_NAME,
  TEST_S3_OBJECT_KEY,
  TEST_ZENDESK_TICKET_ID
} from '../../utils/tests/setup/testConstants'
import { mockLambdaContext } from '../../utils/tests/mocks/mockLambdaContext'
import { assertSecurityHeadersSet } from '../../utils/tests/assertSecurityHeadersSet'

jest.mock('../../sharedServices/getDownloadAvailabilityResult', () => ({
  getDownloadAvailabilityResult: jest.fn()
}))

const TEST_DOWNLOADS_REMAINING = 3

describe('downloadWarning.handler', () => {
  beforeEach(() => jest.resetAllMocks())
  jest.spyOn(logger, 'warn')
  jest.spyOn(logger, 'error')
  const givenNoDownloadAvailable = () => {
    when(getDownloadAvailabilityResult).mockResolvedValue({
      canDownload: false
    })
  }

  const givenDownloadExpired = () => {
    when(getDownloadAvailabilityResult).mockResolvedValue({
      canDownload: false,
      zendeskId: TEST_ZENDESK_TICKET_ID
    })
  }

  const givenDownloadAvailable = (
    downloadsRemaining = TEST_DOWNLOADS_REMAINING
  ) => {
    when(getDownloadAvailabilityResult).mockResolvedValue({
      downloadsRemaining,
      canDownload: true,
      s3ResultsBucket: TEST_QUERY_RESULTS_BUCKET_NAME,
      s3ResultsKey: TEST_S3_OBJECT_KEY
    })
  }

  const invokeHandler = () => {
    return handler(
      {
        ...defaultApiRequest,
        pathParameters: {
          downloadHash: DOWNLOAD_HASH
        }
      },
      mockLambdaContext
    )
  }

  it('should return a 400 if no hash is provided', async () => {
    const result = await handler(defaultApiRequest, mockLambdaContext)
    expect(result.statusCode).toEqual(400)
    expect(result.body).toBe('')
    expect(getDownloadAvailabilityResult).not.toHaveBeenCalled()
  })

  it('should return a 500 if there is an unexpected error', async () => {
    when(getDownloadAvailabilityResult).mockRejectedValue('Some DB error')
    const result = await invokeHandler()

    expect(result.statusCode).toEqual(500)
    expect(result.body).toBe('')

    assertSecurityHeadersSet(result)

    expect(getDownloadAvailabilityResult).toHaveBeenCalledWith(DOWNLOAD_HASH)
    expect(logger.error).toHaveBeenCalledWith(
      'Error while handling download warning request',
      'Some DB error'
    )
  })

  it('should return a 404 if the hash provided does not correspond to a valid download entry', async () => {
    givenNoDownloadAvailable()
    const result = await invokeHandler()

    expect(result.statusCode).toEqual(404)
    expect(result.body).toBe('')

    assertSecurityHeadersSet(result)

    expect(getDownloadAvailabilityResult).toHaveBeenCalledWith(DOWNLOAD_HASH)
    expect(logger.warn).toHaveBeenCalledWith(
      'Returning 404 response because no record was found'
    )
  })

  it('should return a 404 if the hash provided has expired', async () => {
    givenDownloadExpired()
    const result = await invokeHandler()

    expect(result.statusCode).toEqual(404)
    expect(result.body).toBe('')

    assertSecurityHeadersSet(result)

    expect(getDownloadAvailabilityResult).toHaveBeenCalledWith(DOWNLOAD_HASH)
    expect(logger.warn).toHaveBeenCalledWith(
      'Returning 404 response because the download has expired or has been downloaded too many times already'
    )
  })

  it('should return a page containing a submit button to the same URL', async () => {
    givenDownloadAvailable()
    const result = await invokeHandler()

    expect(getDownloadAvailabilityResult).toHaveBeenCalledWith(DOWNLOAD_HASH)
    expect(result.statusCode).toEqual(200)

    assertSecurityHeadersSet(result)

    expect(result.body).toContain('Download the report')
    expect(result.body).toContain(
      `You have ${TEST_DOWNLOADS_REMAINING} downloads remaining.`
    )
  })

  it('should report a single download remaining correctly', async () => {
    givenDownloadAvailable(1)
    const result = await invokeHandler()
    expect(result.body).toContain(`You have 1 download remaining.`)
  })
})
