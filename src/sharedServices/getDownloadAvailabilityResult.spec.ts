import { resetAllWhenMocks, when } from 'jest-when'
import {
  DOWNLOAD_HASH,
  TEST_S3_OBJECT_ARN
} from '../utils/tests/setup/testConstants'
import { getSecureDownloadRecord } from './dynamoDb/getSecureDownloadRecord'
import { getDownloadAvailabilityResult } from './getDownloadAvailabilityResult'
jest.mock('./dynamoDb/getSecureDownloadRecord', () => ({
  getSecureDownloadRecord: jest.fn()
}))

describe('getDownloadAvailabilityResult', () => {
  beforeEach(() => {
    resetAllWhenMocks()
  })

  const givenDownloadRecordAvailable = (downloadsRemaining: number) => {
    when(getSecureDownloadRecord).mockResolvedValue({
      downloadRecordId: DOWNLOAD_HASH,
      downloadsRemaining,
      s3ResultsArn: TEST_S3_OBJECT_ARN
    })
  }

  const givenNoDownloadRecordAvailable = () => {
    when(getSecureDownloadRecord).mockResolvedValue(null)
  }

  it.each([3, 2, 1])(
    'should return download details when available and there are %p downloads available',
    async (downloadsAvailable: number) => {
      givenDownloadRecordAvailable(downloadsAvailable)
      const response = await getDownloadAvailabilityResult(DOWNLOAD_HASH)
      expect(response.downloadsRemaining).toEqual(downloadsAvailable)
      expect(response.hasAvailableDownload).toEqual(true)
      expect(getSecureDownloadRecord).toHaveBeenCalledWith(DOWNLOAD_HASH)
    }
  )

  it('should indicate when no download can be found for a hash', async () => {
    givenNoDownloadRecordAvailable()
    const response = await getDownloadAvailabilityResult(DOWNLOAD_HASH)
    expect(response.hasAvailableDownload).toEqual(false)
    expect(getSecureDownloadRecord).toHaveBeenCalledWith(DOWNLOAD_HASH)
  })

  it('should indicate when the maximum number of downloads has been exceeded', async () => {
    when(getSecureDownloadRecord).mockResolvedValue({
      downloadRecordId: DOWNLOAD_HASH,
      downloadsRemaining: 0,
      s3ResultsArn: TEST_S3_OBJECT_ARN
    })
    const response = await getDownloadAvailabilityResult(DOWNLOAD_HASH)
    expect(response.hasAvailableDownload).toEqual(false)
    expect(response.downloadsRemaining).toEqual(0)
    expect(getSecureDownloadRecord).toHaveBeenCalledWith(DOWNLOAD_HASH)
  })
})
