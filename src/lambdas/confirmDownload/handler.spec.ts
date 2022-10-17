import { defaultApiRequest } from '../../utils/tests/defaultApiRequest'
import { handler } from './handler'
import { getDownloadAvailabilityResult } from '../../sharedServices/getDownloadAvailabilityResult'
import { createTemporaryS3Link } from './createTemporaryS3Link'
import { decrementDownloadCount } from '../../sharedServices/dynamoDb/decrementDownloadCount'
import { when } from 'jest-when'
import {
  DOWNLOAD_HASH,
  TEST_S3_OBJECT_BUCKET,
  TEST_S3_OBJECT_KEY
} from '../../utils/tests/setup/testConstants'

jest.mock('../../sharedServices/getDownloadAvailabilityResult', () => ({
  getDownloadAvailabilityResult: jest.fn()
}))

jest.mock('./createTemporaryS3Link', () => ({
  createTemporaryS3Link: jest.fn()
}))

jest.mock('../../sharedServices/dynamoDb/decrementDownloadCount', () => ({
  decrementDownloadCount: jest.fn()
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
      s3ResultsBucket: TEST_S3_OBJECT_BUCKET,
      s3ResultsKey: TEST_S3_OBJECT_KEY
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

    expect(result.statusCode).toEqual(200)
    expect(createTemporaryS3Link).toHaveBeenCalledWith({
      bucket: TEST_S3_OBJECT_BUCKET,
      key: TEST_S3_OBJECT_KEY
    })
    expect(decrementDownloadCount).toHaveBeenCalledWith(DOWNLOAD_HASH)
  })
})
