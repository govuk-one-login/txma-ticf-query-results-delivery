import { NotifyClient } from 'notifications-node-client'
import { notifyCopy } from '../../constants/notifyCopy'
import { retrieveNotifySecrets } from '../../sharedServices/secrets/retrieveNotifyApiSecrets'
import { PersonalisationOptions } from '../../types/notify/personalisationOptions'
import { getEnv } from '../../utils/getEnv'
import { interpolateTemplate } from '../../utils/interpolateTemplate'

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

  console.log(interpolateTemplate('requestToNotify', notifyCopy))
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

  const responseInfo = {
    status: response.status,
    emailSentTo: requestDetails.email,
    subjectLine: response.data.content.subject
  }
  console.log(responseInfo)
}

const useNotifyMockServer = () => {
  return getEnv('USE_NOTIFY_MOCK_SERVER').toLowerCase() === 'true'
}
