export interface DownloadAvailabilityResult {
  canDownload: boolean
  s3ResultsKey?: string
  s3ResultsBucket?: string
  downloadsRemaining?: number
}
