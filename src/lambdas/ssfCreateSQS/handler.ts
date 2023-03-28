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
  const id = time.toString()

  const client = new SQSClient({ region: getEnv('AWS_REGION') })

  const input: CreateQueueCommandInput = {
    QueueName: `ssf_sqs_${id}.fifo`,
    Attributes: {
      FifoQueue: 'true',
      ContentBasedDeduplication: 'true'
    }
  }

  const result = await client.send(new CreateQueueCommand(input))

  const queueUrl = result.QueueUrl ? result.QueueUrl : ''
  const account = getEnv('AWS_ACCOUNT_ID')
  const queueArn = `arn:aws:sqs:eu-west-2:${account}:ssf_sqs_${id}.fifo`

  await writeToQueueTable(id, queueUrl, queueArn)

  logger.info(queueUrl)
}

// const createPolicy = (account: string, queueArn: string, id: string) => {
//   return `{Version:'2012-10-17',Id:${id},Statement:[{Sid:'1',Effect:'Allow',Principal:{AWS:[${account}]},Action:['sqs:SendMessage','sqs:ReceiveMessage','sqs:DeleteMessage'],Resource:${queueArn}]}`
// }
