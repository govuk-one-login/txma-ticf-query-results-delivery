import { DownloadAvailabilityResult } from '../types/downloadAvailabilityResult'
import { getEnv } from '../utils/getEnv'
import { getSecureDownloadRecord } from './dynamoDb/getSecureDownloadRecord'
import { getExpiredDays } from './getExpiredDays'
export const getDownloadAvailabilityResult = async (
  downloadHash: string
): Promise<DownloadAvailabilityResult> => {
  const record = await getSecureDownloadRecord(downloadHash)
  if (!record) {
    return {
      hasAvailableDownload: false
    }
  }

  const resultProps = {
    hasAvailableDownload: record.downloadsRemaining > 0,
    downloadsRemaining: record.downloadsRemaining,
    s3ResultsBucket: record.s3ResultsBucket,
    s3ResultsKey: record.s3ResultsKey
  }

  const daysLimit = parseInt(getEnv('LINK_EXPIRY_TIME'))
  const numberOfDays = getExpiredDays(record.createdDate)

  if (numberOfDays > daysLimit && record.downloadsRemaining > 0) {
    return {
      ...resultProps
    }
  }

  return {
    ...resultProps,
    createdDate: record.createdDate
  }
}
