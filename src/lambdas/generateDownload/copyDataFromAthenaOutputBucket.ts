import { CopyObjectCommand, CopyObjectCommandInput } from '@aws-sdk/client-s3'
import { getEnv } from '../../../common/utils/getEnv'
import { s3Client } from '../../../common/utils/awsSdkClients'

export const copyDataFromAthenaOutputBucket = async (athenaQueryId: string) => {
  const copyObjectCommandInput: CopyObjectCommandInput = {
    CopySource: `${getEnv('ATHENA_OUTPUT_LOCATION')}/${athenaQueryId}.csv`,
    Bucket: getEnv('QUERY_RESULTS_BUCKET_NAME'),
    Key: `${athenaQueryId}.csv`
  }
  await s3Client.send(new CopyObjectCommand(copyObjectCommandInput))
}
