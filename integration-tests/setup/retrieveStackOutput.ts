import {
  DescribeStacksCommand,
  CloudFormationClient
} from '@aws-sdk/client-cloudformation'

export const retrieveStackOutput = async (stack: string, region: string) => {
  const client = new CloudFormationClient({ region: region })
  const command = new DescribeStacksCommand({ StackName: stack })
  const response = await client.send(command)

  if (!response.Stacks) {
    throw new Error(`Stack with name ${stack} not found.`)
  }

  const outputs = response?.Stacks[0].Outputs

  if (!outputs) {
    throw new Error('Stack has no outputs')
  }

  return outputs
}
