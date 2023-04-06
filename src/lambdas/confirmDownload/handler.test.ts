import { defaultApiRequest } from '../../utils/tests/defaultApiRequest'
import { handler } from './handler'
import { getDownloadAvailabilityResult } from '../../sharedServices/getDownloadAvailabilityResult'
import { createTemporaryS3Link } from './createTemporaryS3Link'
import { decrementDownloadCount } from '../../sharedServices/dynamoDb/decrementDownloadCount'
import { auditTemporaryS3LinkCreated } from './auditTemporaryS3LinkCreated'
import { when } from 'jest-when'
import { logger } from '../../sharedServices/logger'
import {
  DOWNLOAD_HASH,
  TEST_QUERY_RESULTS_BUCKET_NAME,
  TEST_S3_OBJECT_KEY,
  TEST_SIGNED_URL,
  TEST_ZENDESK_TICKET_ID
} from '../../utils/tests/setup/testConstants'
import { mockLambdaContext } from '../../utils/tests/mocks/mockLambdaContext'
import { assertSecurityHeadersSet } from '../../utils/tests/assertSecurityHeadersSet'

jest.mock('../../sharedServices/getDownloadAvailabilityResult', () => ({
  getDownloadAvailabilityResult: jest.fn()
}))

jest.mock('./createTemporaryS3Link', () => ({
  createTemporaryS3Link: jest.fn()
}))

jest.mock('../../sharedServices/dynamoDb/decrementDownloadCount', () => ({
  decrementDownloadCount: jest.fn()
}))

jest.mock('./auditTemporaryS3LinkCreated', () => ({
  auditTemporaryS3LinkCreated: jest.fn()
}))

describe('confirmDownload.handler', () => {
  beforeEach(() => {
    jest.spyOn(logger, 'warn')
    jest.spyOn(logger, 'error')
    jest.resetAllMocks()
  })
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

  const givenDownloadAvailable = () => {
    when(getDownloadAvailabilityResult).mockResolvedValue({
      canDownload: true,
      s3ResultsBucket: TEST_QUERY_RESULTS_BUCKET_NAME,
      s3ResultsKey: TEST_S3_OBJECT_KEY,
      zendeskId: TEST_ZENDESK_TICKET_ID
    })
  }

  it('should return a 400 if no hash is provided', async () => {
    const result = await handler(defaultApiRequest, mockLambdaContext)
    expect(result.statusCode).toEqual(400)
    expect(result.body).toBe('')

    assertSecurityHeadersSet(result)

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
      'Error while handling confirm download request',
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

  it('should return a refresh tag with a signed S3 URL if hash corresponds to a valid download entry', async () => {
    givenDownloadAvailable()
    when(createTemporaryS3Link).mockResolvedValue(TEST_SIGNED_URL)

    const result = await invokeHandler()

    expect(result.statusCode).toEqual(200)
    expect(result.body).toContain(
      `<meta http-equiv="refresh" content="0; url=${TEST_SIGNED_URL}">`
    )

    assertSecurityHeadersSet(result)

    expect(createTemporaryS3Link).toHaveBeenCalledWith({
      bucket: TEST_QUERY_RESULTS_BUCKET_NAME,
      key: TEST_S3_OBJECT_KEY
    })
    expect(decrementDownloadCount).toHaveBeenCalledWith(DOWNLOAD_HASH)
    expect(auditTemporaryS3LinkCreated).toHaveBeenCalledWith(
      TEST_ZENDESK_TICKET_ID
    )
  })

  it('should show the headline and body text on page when download is available', async () => {
    givenDownloadAvailable()
    const result = await invokeHandler()
    expect(result.body).toContain('Fraud secure page')
    expect(result.body).toContain(
      'Your data will automatically download in CSV format.'
    )

    assertSecurityHeadersSet(result)
  })
})
