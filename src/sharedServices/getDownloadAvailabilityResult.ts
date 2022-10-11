import { DownloadAvailibilityResult } from '../types/downloadAvailabilityResult'
// import { getSecureDownloadRecord } from './dynamoDb/getSecureDownloadRecord'
export const getDownloadAvailabilityResult = async (
  downloadHash: string
): Promise<DownloadAvailibilityResult> => {
  console.log('looking for download availability for ', downloadHash)
  return {
    hasAvailableDownload: false
  }
}
