import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getEnv } from '../../utils/getEnv'

const SIGNED_URL_EXPIRY_SECONDS = 300

export const createTemporaryS3Link = (s3BucketDetails: {
  bucket: string
  key: string
}): Promise<string> => {
  const client = new S3Client({ region: getEnv('AWS_REGION') })
  const command = new GetObjectCommand({
    Bucket: s3BucketDetails.bucket,
    Key: s3BucketDetails.key
  })
  return getSignedUrl(client, command, {
    expiresIn: SIGNED_URL_EXPIRY_SECONDS
  })
}
