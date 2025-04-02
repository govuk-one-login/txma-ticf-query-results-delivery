import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { s3Client } from '../../../common/utils/awsSdkClients'

const SIGNED_URL_EXPIRY_SECONDS = 300

export const createTemporaryS3Link = (s3BucketDetails: {
  bucket: string
  key: string
}): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: s3BucketDetails.bucket,
    Key: s3BucketDetails.key
  })
  return getSignedUrl(s3Client, command, {
    expiresIn: SIGNED_URL_EXPIRY_SECONDS
  })
}
