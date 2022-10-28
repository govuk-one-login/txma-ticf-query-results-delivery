export interface SecureDownloadRecord {
  downloadHash: string
  downloadsRemaining: number
  s3ResultsKey: string
  s3ResultsBucket: string
  createdDate: number
}

export const isSecureDownloadRecord = (
  arg: unknown
): arg is SecureDownloadRecord => {
  const test = arg as SecureDownloadRecord
  return (
    typeof test?.downloadHash === 'string' &&
    typeof test?.downloadsRemaining === 'number' &&
    typeof test?.s3ResultsKey === 'string' &&
    typeof test?.s3ResultsBucket === 'string' &&
    typeof test?.createdDate === 'number' &&
    test?.downloadsRemaining >= 0
  )
}
