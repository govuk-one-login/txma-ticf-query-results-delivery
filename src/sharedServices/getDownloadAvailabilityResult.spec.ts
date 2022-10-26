import { resetAllWhenMocks, when } from 'jest-when'
import {
  DOWNLOAD_HASH,
  TEST_S3_OBJECT_BUCKET,
  TEST_S3_OBJECT_KEY,
  TEST_CREATED_DATE
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
      downloadHash: DOWNLOAD_HASH,
      downloadsRemaining,
      s3ResultsBucket: TEST_S3_OBJECT_BUCKET,
      s3ResultsKey: TEST_S3_OBJECT_KEY,
      createdDate: TEST_CREATED_DATE
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
      expect(response.s3ResultsBucket).toEqual(TEST_S3_OBJECT_BUCKET)
      expect(response.s3ResultsKey).toEqual(TEST_S3_OBJECT_KEY)
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
      downloadHash: DOWNLOAD_HASH,
      downloadsRemaining: 0,
      s3ResultsBucket: TEST_S3_OBJECT_BUCKET,
      s3ResultsKey: TEST_S3_OBJECT_KEY,
      createdDate: TEST_CREATED_DATE
    })
    const response = await getDownloadAvailabilityResult(DOWNLOAD_HASH)
    expect(response.hasAvailableDownload).toEqual(false)
    expect(response.downloadsRemaining).toEqual(0)
    expect(getSecureDownloadRecord).toHaveBeenCalledWith(DOWNLOAD_HASH)
  })
})
