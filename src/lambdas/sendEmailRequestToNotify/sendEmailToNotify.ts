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
    emailSentTo: JSON.parse(response.config.data).email_address,
    subjectLine: response.data.content.subject
  }
  console.log(responseInfo)
}

const useNotifyMockServer = () => {
  return getEnv('USE_NOTIFY_MOCK_SERVER').toLowerCase() === 'true'
}
