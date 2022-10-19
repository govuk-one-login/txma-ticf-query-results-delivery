export interface DownloadAvailabilityResult {
  hasAvailableDownload: boolean
  s3ResultsKey?: string
  s3ResultsBucket?: string
  downloadsRemaining?: number
}
