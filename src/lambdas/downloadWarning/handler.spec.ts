import { defaultApiRequest } from '../../utils/tests/defaultApiRequest'
import { handler } from './handler'
import { getDownloadAvailabilityResult } from '../../sharedServices/getDownloadAvailabilityResult'
import { when } from 'jest-when'
import {
  DOWNLOAD_HASH,
  TEST_S3_OBJECT_BUCKET,
  TEST_S3_OBJECT_KEY
} from '../../utils/tests/setup/testConstants'

jest.mock('../../sharedServices/getDownloadAvailabilityResult', () => ({
  getDownloadAvailabilityResult: jest.fn()
}))

const TEST_DOWNLOADS_REMAINING = 3

describe('downloadWarning.handler', () => {
  beforeEach(() => jest.resetAllMocks())
  const givenNoDownloadAvailable = () => {
    when(getDownloadAvailabilityResult).mockResolvedValue({
      canDownload: false
    })
  }

  const givenDownloadAvailable = (
    downloadsRemaining = TEST_DOWNLOADS_REMAINING
  ) => {
    when(getDownloadAvailabilityResult).mockResolvedValue({
      downloadsRemaining,
      canDownload: true,
      s3ResultsBucket: TEST_S3_OBJECT_BUCKET,
      s3ResultsKey: TEST_S3_OBJECT_KEY
    })
  }

  it('should return a 400 if no hash is provided', async () => {
    const result = await handler(defaultApiRequest)
    expect(result.statusCode).toEqual(400)
    expect(result.body).toBe('')
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
    expect(result.body).toBe('')
    expect(getDownloadAvailabilityResult).toHaveBeenCalledWith(DOWNLOAD_HASH)
  })

  it('should return a page containing a submit button to the same URL', async () => {
    givenDownloadAvailable()
    const result = await handler({
      ...defaultApiRequest,
      pathParameters: {
        downloadHash: DOWNLOAD_HASH
      }
    })

    expect(getDownloadAvailabilityResult).toHaveBeenCalledWith(DOWNLOAD_HASH)
    expect(result.statusCode).toEqual(200)
    expect(result.body).toContain('Download the report')
    expect(result.body).toContain(
      `You have ${TEST_DOWNLOADS_REMAINING} attempts before the link expires.`
    )
  })

  it('should report a single download remaining correctly', async () => {
    givenDownloadAvailable(1)
    const result = await handler({
      ...defaultApiRequest,
      pathParameters: {
        downloadHash: DOWNLOAD_HASH
      }
    })
    expect(result.body).toContain(`You have 1 attempt before the link expires.`)
  })
})
