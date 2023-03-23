import { Context } from 'aws-lambda'
import {
  SQSClient,
  CreateQueueCommand,
  CreateQueueCommandInput
} from '@aws-sdk/client-sqs'
import { getEnv } from '../../utils/getEnv'
import { initialiseLogger, logger } from '../../sharedServices/logger'

export const handler = async (context: Context) => {
  initialiseLogger(context)

  const id = Date.now()

  const client = new SQSClient({ region: getEnv('AWS_REGION') })

  const input: CreateQueueCommandInput = {
    QueueName: id,
    Attributes: {
      MessageRetentionPeriod: 86400
    }
  }

  const result = await client.send(new CreateQueueCommand(input))

  logger.info(`${result.QueueUrl}`)
}
