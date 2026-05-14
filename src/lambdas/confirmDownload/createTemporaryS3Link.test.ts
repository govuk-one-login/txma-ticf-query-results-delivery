import { createTemporaryS3Link } from './createTemporaryS3Link'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  TEST_AWS_REGION,
  TEST_QUERY_RESULTS_BUCKET_NAME,
  TEST_S3_OBJECT_KEY,
  TEST_SIGNED_URL
} from '../../../common/utils/tests/setup/testConstants'

vi.mock('@aws-sdk/client-s3', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  S3Client: vi.fn().mockImplementation(function (this: any) {
    return this
  }),
  GetObjectCommand: vi.fn().mockImplementation(function (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this: any,
    input: object
  ) {
    Object.assign(this, input)
  })
}))

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockImplementation(() => TEST_SIGNED_URL)
}))

const testGetObjectCommandInput = {
  Bucket: TEST_QUERY_RESULTS_BUCKET_NAME,
  Key: TEST_S3_OBJECT_KEY
}

describe('createTemporaryS3Link', () => {
  const s3BucketDetails = {
    bucket: TEST_QUERY_RESULTS_BUCKET_NAME,
    key: TEST_S3_OBJECT_KEY
  }

  it('should receive a call with the correct parameters', async () => {
    const returnUrl = await createTemporaryS3Link(s3BucketDetails)

    expect(S3Client).toHaveBeenCalledWith({ region: TEST_AWS_REGION })
    expect(GetObjectCommand).toHaveBeenCalledWith(testGetObjectCommandInput)
    expect(getSignedUrl).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining(testGetObjectCommandInput),
      { expiresIn: 300 }
    )
    expect(returnUrl).toEqual(TEST_SIGNED_URL)
  })
})
