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

  return {
    hasAvailableDownload: record.downloadsRemaining > 0,
    downloadsRemaining: record.downloadsRemaining,
    s3ResultsBucket: record.s3ResultsBucket,
    s3ResultsKey: record.s3ResultsKey
  }
}
