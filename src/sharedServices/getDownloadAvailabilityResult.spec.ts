import { resetAllWhenMocks, when } from 'jest-when'
import {
  DOWNLOAD_HASH,
  TEST_QUERY_RESULTS_BUCKET_NAME,
  TEST_S3_OBJECT_KEY,
  TEST_CREATED_DATE,
  TEST_LINK_EXPIRY_TIME
} from '../utils/tests/setup/testConstants'
import { getSecureDownloadRecord } from './dynamoDb/getSecureDownloadRecord'
import { getDownloadAvailabilityResult } from './getDownloadAvailabilityResult'
import { isDateOverDaysLimit } from './isDateOverDaysLimit'
jest.mock('./isDateOverDaysLimit', () => ({
  isDateOverDaysLimit: jest.fn()
}))

jest.mock('./dynamoDb/getSecureDownloadRecord', () => ({
  getSecureDownloadRecord: jest.fn()
}))
jest.mock('../utils/currentDateEpochMilliseconds', () => ({
  currentDateEpochMilliseconds: jest.fn()
}))

describe('getDownloadAvailabilityResult', () => {
  beforeEach(() => {
    resetAllWhenMocks()
  })

  const givenDownloadRecordAvailable = (downloadsRemaining: number) => {
    when(getSecureDownloadRecord).mockResolvedValue({
      downloadHash: DOWNLOAD_HASH,
      downloadsRemaining,
      s3ResultsBucket: TEST_QUERY_RESULTS_BUCKET_NAME,
      s3ResultsKey: TEST_S3_OBJECT_KEY,
      createdDate: TEST_CREATED_DATE
    })
  }

  const givenNoDownloadRecordAvailable = () => {
    when(getSecureDownloadRecord).mockResolvedValue(null)
  }

  const givenDateOverDateLimit = () => {
    when(isDateOverDaysLimit).mockReturnValue(true)
  }

  const givenDateWithinDateLimit = () => {
    when(isDateOverDaysLimit).mockReturnValue(false)
  }

  it.each([3, 2, 1])(
    'should return download details when available and there are %p downloads available',
    async (downloadsAvailable: number) => {
      givenDateWithinDateLimit()
      givenDownloadRecordAvailable(downloadsAvailable)
      const response = await getDownloadAvailabilityResult(DOWNLOAD_HASH)
      expect(response.downloadsRemaining).toEqual(downloadsAvailable)
      expect(response.canDownload).toEqual(true)
      expect(response.s3ResultsBucket).toEqual(TEST_QUERY_RESULTS_BUCKET_NAME)
      expect(response.s3ResultsKey).toEqual(TEST_S3_OBJECT_KEY)
      expect(getSecureDownloadRecord).toHaveBeenCalledWith(DOWNLOAD_HASH)
    }
  )

  it('should indicate when no download can be found for a hash', async () => {
    givenDateWithinDateLimit()
    givenNoDownloadRecordAvailable()
    const response = await getDownloadAvailabilityResult(DOWNLOAD_HASH)
    expect(response.canDownload).toEqual(false)
    expect(getSecureDownloadRecord).toHaveBeenCalledWith(DOWNLOAD_HASH)
  })

  it('should return no available download result when the maximum number of downloads has been exceeded', async () => {
    givenDateWithinDateLimit()
    when(getSecureDownloadRecord).mockResolvedValue({
      downloadHash: DOWNLOAD_HASH,
      downloadsRemaining: 0,
      s3ResultsBucket: TEST_QUERY_RESULTS_BUCKET_NAME,
      s3ResultsKey: TEST_S3_OBJECT_KEY,
      createdDate: TEST_CREATED_DATE
    })
    const response = await getDownloadAvailabilityResult(DOWNLOAD_HASH)
    expect(response.canDownload).toEqual(false)
    expect(response.downloadsRemaining).toEqual(0)
    expect(getSecureDownloadRecord).toHaveBeenCalledWith(DOWNLOAD_HASH)
  })

  it('should return no available download result when the created date is over the date limit', async () => {
    givenDateOverDateLimit()
    givenDownloadRecordAvailable(3)
    const response = await getDownloadAvailabilityResult(DOWNLOAD_HASH)
    expect(response.canDownload).toEqual(false)
    expect(response.downloadsRemaining).toEqual(3)
    expect(getSecureDownloadRecord).toHaveBeenCalledWith(DOWNLOAD_HASH)
    expect(isDateOverDaysLimit).toHaveBeenCalledWith(
      TEST_CREATED_DATE,
      TEST_LINK_EXPIRY_TIME
    )
  })
})
