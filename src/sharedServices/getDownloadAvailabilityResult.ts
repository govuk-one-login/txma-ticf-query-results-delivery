import { DownloadAvailabilityResult } from '../types/downloadAvailabilityResult'
import { getEnv } from '../utils/getEnv'
import { getSecureDownloadRecord } from './dynamoDb/getSecureDownloadRecord'
import { isDateOverDaysLimit } from './isDateOverDaysLimit'
export const getDownloadAvailabilityResult = async (
  downloadHash: string
): Promise<DownloadAvailabilityResult> => {
  const record = await getSecureDownloadRecord(downloadHash)
  if (!record) {
    return {
      hasAvailableDownload: false
    }
  }

  return {
    hasAvailableDownload:
      record.downloadsRemaining > 0 &&
      !isDateOverDaysLimit(
        record.createdDate,
        parseInt(getEnv('LINK_EXPIRY_TIME'))
      ),
    downloadsRemaining: record.downloadsRemaining,
    s3ResultsBucket: record.s3ResultsBucket,
    s3ResultsKey: record.s3ResultsKey
  }
}
