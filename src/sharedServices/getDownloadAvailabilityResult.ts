import { DownloadAvailibilityResult } from '../types/downloadAvailabilityResult'

export const getDownloadAvailabilityResult = async (
  downloadHash: string
): Promise<DownloadAvailibilityResult> => {
  console.log('looking for download availability for ', downloadHash)
  return {
    hasAvailableDownload: false
  }
}
