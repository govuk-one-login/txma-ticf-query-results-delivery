import {
  GetSecretValueCommand,
  GetSecretValueCommandInput
} from '@aws-sdk/client-secrets-manager'
import { secretsManagerClient } from '../../../common/utils/awsSdkClients'

export const retrieveSecrets = async (
  secretId: string
): Promise<Record<string, string>> => {
  const command: GetSecretValueCommandInput = {
    SecretId: secretId
  }
  const data = await secretsManagerClient.send(
    new GetSecretValueCommand(command)
  )
  return JSON.parse(data.SecretString as string)
}
