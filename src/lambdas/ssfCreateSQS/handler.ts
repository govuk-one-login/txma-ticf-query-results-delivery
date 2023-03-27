import { Context } from 'aws-lambda'
import {
  SQSClient,
  CreateQueueCommand,
  CreateQueueCommandInput
} from '@aws-sdk/client-sqs'
import { getEnv } from '../../utils/getEnv'
import { initialiseLogger, logger } from '../../sharedServices/logger'
import { writeToQueueTable } from '../../sharedServices/dynamoDb/ssfQueueTable'

export const handler = async (context: Context) => {
  initialiseLogger(context)

  const time = Date.now()
  const id = `ssf_sqs_${time.toString()}.fifo`

  const client = new SQSClient({ region: getEnv('AWS_REGION') })

  const input: CreateQueueCommandInput = {
    QueueName: id,
    Attributes: {
      FifoQueue: 'true'
    }
  }

  const result = await client.send(new CreateQueueCommand(input))

  const queueUrl = result.QueueUrl ? result.QueueUrl : ''
  const queueArn = 'testArn'

  await writeToQueueTable(id, queueUrl, queueArn)

  logger.info(queueUrl)
}
