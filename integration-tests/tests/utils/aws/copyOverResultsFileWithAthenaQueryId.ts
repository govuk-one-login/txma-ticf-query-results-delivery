import {
  CopyObjectCommand,
  CopyObjectCommandInput,
  S3Client
} from '@aws-sdk/client-s3'
import crypto from 'crypto'
import { getIntegrationTestEnvironmentVariable } from '../getIntegrationTestEnvironmentVariable'

export const copyOverResultsFileWithAthenaQueryId =
  async (): Promise<string> => {
    const athenaQueryId = crypto.randomUUID()
    const input = {
      CopySource: `${getIntegrationTestEnvironmentVariable(
        'ATHENA_OUTPUT_BUCKET'
      )}/test/testResults.csv`,
      Key: `${athenaQueryId}.csv`,
      Bucket: getIntegrationTestEnvironmentVariable('ATHENA_OUTPUT_BUCKET')
    } as CopyObjectCommandInput

    const command = new CopyObjectCommand(input)

    const s3Client = new S3Client({
      region: getIntegrationTestEnvironmentVariable('AWS_REGION')
    })

    try {
      await s3Client.send(command)
    } catch (error) {
      throw Error(
        'Failed to copy the test results file between ' +
          input.CopySource +
          ' and ' +
          'input.Bucket'
      )
    }

    return athenaQueryId
  }
