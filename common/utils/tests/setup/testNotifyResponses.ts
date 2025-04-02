import { CustomAxiosResponse } from '../../../types/notify/customAxiosResponse'
import {
  ALL_NOTIFY_SECRETS,
  TEST_NOTIFY_EMAIL,
  TEST_NOTIFY_NAME,
  TEST_NOTIFY_RESPONSE_ID,
  TEST_ZENDESK_TICKET_ID
} from './testConstants'

export const testSuccessfulNotifyResponse: CustomAxiosResponse = {
  status: 201,
  statusText: 'Created',
  config: {
    method: 'post',
    url: 'api.endpoint.com/email',
    data: `{
      "template_id":"${ALL_NOTIFY_SECRETS.notifyTemplateId}",
      "email_address":"${TEST_NOTIFY_EMAIL}",
      "personalisation":{
        "firstName":"${TEST_NOTIFY_NAME}",
        "zendeskId":"${TEST_ZENDESK_TICKET_ID}",
        "secureDownloadUrl":"mySecureDownloadUrl.com"
      }
    }`
  },
  data: {
    id: TEST_NOTIFY_RESPONSE_ID,
    content: {
      subject: 'Your data query has completed'
    }
  }
}
