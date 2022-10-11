import { defaultApiRequest } from '../../utils/tests/defaultApiRequest'
import { handler } from './handler'
import { getDownloadAvailabilityResult } from '../../sharedServices/getDownloadAvailabilityResult'
import { createTemporaryS3Link } from './createTemporaryS3Link'
import { when } from 'jest-when'
import { DOWNLOAD_HASH, TEST_S3_OBJECT_ARN } from '../../utils/tests/setup/testConstants'

jest.mock('../../sharedServices/getDownloadAvailabilityResult', () => ({
  getDownloadAvailabilityResult: jest.fn()
}))

jest.mock('./createTemporaryS3Link', () => ({
  createTemporaryS3Link: jest.fn()
}))

describe('confirmDownload.handler', () => {
  beforeEach(() => jest.resetAllMocks())
  const givenNoDownloadAvailable = () => {
    when(getDownloadAvailabilityResult).mockResolvedValue({
      hasAvailableDownload: false
    })
  }

  const givenDownloadAvailable = () => {
    when(getDownloadAvailabilityResult).mockResolvedValue({
      hasAvailableDownload: true,
      s3ObjectArn: TEST_S3_OBJECT_ARN
    })
  }
  it('should return a 400 if no hash is provided', async () => {
    const result = await handler(defaultApiRequest)
    expect(result.statusCode).toEqual(400)
    expect(getDownloadAvailabilityResult).not.toHaveBeenCalled()
  })

  it('should return a 404 if the hash provided does not correspond to a valid download entry', async () => {
    givenNoDownloadAvailable()
    const result = await handler({
      ...defaultApiRequest,
      pathParameters: {
        downloadHash: DOWNLOAD_HASH
      }
    })

    expect(result.statusCode).toEqual(404)
    expect(getDownloadAvailabilityResult).toHaveBeenCalledWith(DOWNLOAD_HASH)
  })

  it('should redirect to signed S3 URL if has corresponds to a valid download entry', async () => {
    givenDownloadAvailable()
    const result = await handler({
      ...defaultApiRequest,
      pathParameters: {
        downloadHash: DOWNLOAD_HASH
      }
    })

    expect(result.statusCode).toEqual(301)
    expect(createTemporaryS3Link).toHaveBeenCalledWith(TEST_S3_OBJECT_ARN)
  })
})
