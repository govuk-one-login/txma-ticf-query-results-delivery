import { DownloadAvailabilityResult } from '../types/downloadAvailabilityResult'
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

  const daysLimit = 7 // <- this will come from an environment variable?

  const currentDateEpochMilliseconds = (): number => Date.now()

  const daysElapsed = (startDate: number, endDate: number) => {
    const diffInMs = endDate - startDate
    return Math.floor(diffInMs / (1000 * 3600 * 24))
  }

  const numberOfDays = daysElapsed(
    record.createdDate,
    currentDateEpochMilliseconds()
  )

  console.log(`createdDate: ${record.createdDate}`)
  console.log(`daysLimit: ${daysLimit}`)
  console.log(`currentDateEpochMilliseconds: ${currentDateEpochMilliseconds()}`)
  console.log(`numberOfDays: ${numberOfDays}`)
  console.log(
    `cndtion: ${numberOfDays > daysLimit && record.downloadsRemaining > 0}`
  )

  // When elapsed days is greater than allowed days
  if (numberOfDays > daysLimit && record.downloadsRemaining > 0) {
    return {
      hasAvailableDownload: record.downloadsRemaining > 0,
      downloadsRemaining: record.downloadsRemaining,
      s3ResultsBucket: record.s3ResultsBucket,
      s3ResultsKey: record.s3ResultsKey
    }
  }

  return {
    hasAvailableDownload: record.downloadsRemaining > 0,
    downloadsRemaining: record.downloadsRemaining,
    s3ResultsBucket: record.s3ResultsBucket,
    s3ResultsKey: record.s3ResultsKey,
    createdDate: record.createdDate
  }
}
