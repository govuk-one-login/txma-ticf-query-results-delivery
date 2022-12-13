import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'
import { getIntegrationTestEnvironmentVariable } from '../tests/utils/getIntegrationTestEnvironmentVariable'

export const retrieveSSMParameterValue = async (parameterName: string) => {
  const ssmClient = new SSMClient({
    region: getIntegrationTestEnvironmentVariable('AWS_REGION')
  })
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
