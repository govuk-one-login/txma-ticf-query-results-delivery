import { getEnv } from '../utils/getEnv'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'
import { SQSClient } from '@aws-sdk/client-sqs'
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager'

export const ddbClient = new DynamoDBClient({ region: getEnv('AWS_REGION') })
export const s3Client = new S3Client({ region: getEnv('AWS_REGION') })
export const sqsClient = new SQSClient({ region: getEnv('AWS_REGION') })
export const secretsManagerClient = new SecretsManagerClient({
  region: getEnv('AWS_REGION')
})
