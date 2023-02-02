import {
  CopyObjectCommand,
  CopyObjectCommandInput,
  S3Client
} from '@aws-sdk/client-s3'
import { getEnv } from '../../utils/getEnv'

export const copyDataFromAthenaOutputBucket = async (athenaQueryId: string) => {
  const copyObjectCommandInput: CopyObjectCommandInput = {
    CopySource: `${getEnv('ATHENA_OUTPUT_LOCATION')}/${athenaQueryId}.csv`,
    Bucket: getEnv('QUERY_RESULTS_BUCKET_NAME'),
    Key: `${athenaQueryId}.csv`
  }
  const client = new S3Client({ region: getEnv('AWS_REGION') })
  await client.send(new CopyObjectCommand(copyObjectCommandInput))
}
