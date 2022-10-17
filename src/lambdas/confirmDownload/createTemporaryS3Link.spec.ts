import { createTemporaryS3Link } from './createTemporaryS3Link'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  TEST_AWS_REGION,
  TEST_S3_OBJECT_BUCKET,
  TEST_S3_OBJECT_KEY,
  TEST_SIGNED_URL
} from '../../utils/tests/setup/testConstants'

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockReturnValue({}),
  GetObjectCommand: jest
    .fn()
    .mockImplementation(() => testGetObjectCommandInput)
}))

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockImplementation(() => TEST_SIGNED_URL)
}))

const testGetObjectCommandInput = {
  Bucket: TEST_S3_OBJECT_BUCKET,
  Key: TEST_S3_OBJECT_KEY
}

describe('createTemporaryS3Link', () => {
  const s3BucketDetails = {
    bucket: TEST_S3_OBJECT_BUCKET,
    key: TEST_S3_OBJECT_KEY
  }

  it('should receive a call with the correct parameters', async () => {
    const returnUrl = await createTemporaryS3Link(s3BucketDetails)

    expect(S3Client).toHaveBeenCalledWith({ region: TEST_AWS_REGION })
    expect(GetObjectCommand).toHaveBeenCalledWith(testGetObjectCommandInput)
    expect(getSignedUrl).toHaveBeenCalledWith({}, testGetObjectCommandInput, {
      expiresIn: 300
    })
    expect(returnUrl).toEqual(TEST_SIGNED_URL)
  })
})
