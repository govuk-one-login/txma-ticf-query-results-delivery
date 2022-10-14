export const createTemporaryS3Link = async (
  s3Location: string
): Promise<string> => {
  console.log('creating temporary link for ', s3Location)
  return Promise.resolve('https://fake-link')
}
