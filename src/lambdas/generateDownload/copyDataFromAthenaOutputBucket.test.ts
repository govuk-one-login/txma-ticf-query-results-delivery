import { CopyObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { mockClient } from 'aws-sdk-client-mock'
import { copyDataFromAthenaOutputBucket } from './copyDataFromAthenaOutputBucket'
import 'aws-sdk-client-mock-jest'
import {
  TEST_ATHENA_OUTPUT_LOCATION,
  TEST_ATHENA_QUERY_ID,
  TEST_QUERY_RESULTS_BUCKET_NAME
} from '../../../common/utils/tests/setup/testConstants'

const s3MockClient = mockClient(S3Client)
describe('copyDataFromAthenaOutputBucket', () => {
  it('should issue the correct command to copy data from the athena output bucket', async () => {
    await copyDataFromAthenaOutputBucket(TEST_ATHENA_QUERY_ID)
    expect(s3MockClient).toHaveReceivedCommandWith(CopyObjectCommand, {
      Bucket: TEST_QUERY_RESULTS_BUCKET_NAME,
      CopySource: `${TEST_ATHENA_OUTPUT_LOCATION}/${TEST_ATHENA_QUERY_ID}.csv`,
      Key: `${TEST_ATHENA_QUERY_ID}.csv`
    })
  })
})
