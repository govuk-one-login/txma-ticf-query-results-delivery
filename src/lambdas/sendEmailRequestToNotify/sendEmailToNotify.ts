import { NotifyClient } from 'notifications-node-client'
import { logger } from '../../../common/sharedServices/logger'
import { retrieveNotifySecrets } from '../../../common/sharedServices/secrets/retrieveNotifyApiSecrets'
import { PersonalisationOptions } from '../../../common/types/notify/personalisationOptions'
import { getEnv } from '../../../common/utils/getEnv'

export const sendEmailToNotify = async (
  requestDetails: PersonalisationOptions
) => {
  const secrets = await retrieveNotifySecrets()
  // The NotifyClient constructor has an undocumented feature that lets you pass in a different base URL
  // than the production one. This lets us override the default when we want to do mocking.
  // We discovered this by looking at the source code
  // https://github.com/alphagov/notifications-node-client/blob/main/client/api_client.js#L17
  const notifyClient = useNotifyMockServer()
    ? new NotifyClient(getEnv('MOCK_SERVER_BASE_URL'), secrets.notifyApiKey)
    : new NotifyClient(secrets.notifyApiKey)

  const response = await Promise.resolve(
    notifyClient.sendEmail(secrets.notifyTemplateId, requestDetails.email, {
      personalisation: {
        firstName: requestDetails.firstName,
        zendeskId: requestDetails.zendeskId,
        secureDownloadUrl: requestDetails.secureDownloadUrl
      },
      reference: requestDetails.zendeskId
    })
  )
  logger.info('Finished sending email with Notify API', {
    notifyResponseId: response.data.id
  })
}

const useNotifyMockServer = () => {
  return getEnv('USE_NOTIFY_MOCK_SERVER').toLowerCase() === 'true'
}
