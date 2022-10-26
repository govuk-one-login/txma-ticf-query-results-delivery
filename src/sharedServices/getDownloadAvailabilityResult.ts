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

  console.log(`daysLimit: ${daysLimit}`)
  console.log(`currentDateEpochMilliseconds: ${currentDateEpochMilliseconds()}`)
  console.log(`daysElapsed: ${daysElapsed}`)

  const numberOfDays = daysElapsed(
    record.createdDate,
    currentDateEpochMilliseconds()
  )

  console.log(`numberOfDays: ${numberOfDays}`)

  console.log(
    `${
      numberOfDays > daysLimit &&
      record.downloadsRemaining > 0 &&
      !record.createdDate
    }`
  )

  // When elapsed days is greater than allowed days
  if (
    numberOfDays > daysLimit &&
    record.downloadsRemaining > 0 &&
    !record.createdDate
  ) {
    return {
      hasAvailableDownload: false,
      createdDate: undefined
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
