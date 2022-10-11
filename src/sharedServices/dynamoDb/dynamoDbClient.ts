import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { getEnv } from '../../utils/getEnv'

const ddbClient = new DynamoDBClient({ region: getEnv('AWS_REGION') })

export { ddbClient }
