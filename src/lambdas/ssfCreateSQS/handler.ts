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
    QueueName: `ssf_sqs_not_sent_${id}.fifo`,
    Attributes: {
      FifoQueue: 'true',
      ContentBasedDeduplication: 'true',
      VisibilityTimeout: '0'
    }
  }

  const sentInput: CreateQueueCommandInput = {
    QueueName: `ssf_sqs_sent_${id}.fifo`,
    Attributes: {
      FifoQueue: 'true',
      ContentBasedDeduplication: 'true',
      VisibilityTimeout: '30'
    }
  }

  const result = await client.send(new CreateQueueCommand(input))
  const sentResult = await client.send(new CreateQueueCommand(sentInput))

  const queueUrl = result.QueueUrl ? result.QueueUrl : ''
  const sentQueueUrl = sentResult.QueueUrl ? sentResult.QueueUrl : ''
  // const account = getEnv('AWS_ACCOUNT_ID')
  const queueArn = 'testArn'

  await writeToQueueTable(id, queueUrl, queueArn, sentQueueUrl)

  logger.info(queueUrl)
}

// const createPolicy = (account: string, queueArn: string, id: string) => {
//   return `{Version:'2012-10-17',Id:${id},Statement:[{Sid:'1',Effect:'Allow',Principal:{AWS:[${account}]},Action:['sqs:SendMessage','sqs:ReceiveMessage','sqs:DeleteMessage'],Resource:${queueArn}]}`
// }