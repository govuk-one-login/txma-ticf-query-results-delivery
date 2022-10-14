export interface SecureDownloadRecord {
  downloadHash: string
  downloadsRemaining: number
  s3ResultsArn: string
}

export const isSecureDownloadRecord = (
  arg: unknown
): arg is SecureDownloadRecord => {
  const test = arg as SecureDownloadRecord
  return (
    typeof test?.downloadHash === 'string' &&
    typeof test?.downloadsRemaining === 'number' &&
    typeof test?.s3ResultsArn === 'string' &&
    test?.downloadsRemaining >= 0
  )
}
