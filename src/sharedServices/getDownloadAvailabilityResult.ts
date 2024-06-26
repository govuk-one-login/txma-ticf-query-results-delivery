import { appendZendeskIdToLogger } from './logger'
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
      canDownload: false
    }
  }
  appendZendeskIdToLogger(record.zendeskId)

  const canDownload =
    record.downloadsRemaining > 0 &&
    !isDateOverDaysLimit(
      record.createdDate,
      parseInt(getEnv('LINK_EXPIRY_TIME'))
    )

  return {
    canDownload,
    downloadsRemaining: record.downloadsRemaining,
    s3ResultsBucket: record.s3ResultsBucket,
    s3ResultsKey: record.s3ResultsKey,
    zendeskId: record.zendeskId
  }
}
