import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

export const retrieveSSMParameterValue = async (parameterName: string) => {
  const ssmClient = new SSMClient({ region: 'eu-west-2' })
  const command = new GetParameterCommand({ Name: parameterName })

  try {
    const response = await ssmClient.send(command)
    if (response.Parameter?.Value) {
      return response.Parameter?.Value
    }
  } catch (error) {
    throw Error(
      `Error retrieving SSM parameter with name  ${parameterName}\n${error}`
    )
  }
}
