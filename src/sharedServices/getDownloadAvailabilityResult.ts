import { DownloadAvailabilityResult } from '../types/downloadAvailabilityResult'
import { currentDateEpochMilliseconds } from '../utils/currentDateEpochMilliseconds'
import { getEnv } from '../utils/getEnv'
import { getSecureDownloadRecord } from './dynamoDb/getSecureDownloadRecord'
export const getDownloadAvailabilityResult = async (
  downloadHash: string
): Promise<DownloadAvailabilityResult> => {
  const record = await getSecureDownloadRecord(downloadHash)
  if (!record) {
    return {
      hasAvailableDownload: false
    }
  }

  const daysLimit = parseInt(getEnv('LINK_EXPIRY_TIME'))
  const resultProps = {
    hasAvailableDownload: record.downloadsRemaining > 0,
    downloadsRemaining: record.downloadsRemaining,
    s3ResultsBucket: record.s3ResultsBucket,
    s3ResultsKey: record.s3ResultsKey
  }
  const daysElapsed = (startDate: number, endDate: number) => {
    const diffInMs = endDate - startDate
    return Math.floor(diffInMs / (1000 * 3600 * 24))
  }

  const numberOfDays = daysElapsed(
    record.createdDate,
    currentDateEpochMilliseconds()
  )

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
