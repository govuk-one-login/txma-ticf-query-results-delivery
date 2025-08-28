import { sendEmailToNotify } from './sendEmailToNotify'
import { NotifyClient } from 'notifications-node-client'
import { retrieveNotifySecrets } from '../../../common/sharedServices/secrets/retrieveNotifyApiSecrets'
import {
  ALL_NOTIFY_SECRETS,
  TEST_NOTIFY_EMAIL,
  TEST_NOTIFY_NAME,
  TEST_NOTIFY_RESPONSE_ID,
  TEST_SECURE_DOWNLOAD_URL,
  TEST_ZENDESK_TICKET_ID
} from '../../../common/utils/tests/setup/testConstants'
import { testSuccessfulNotifyResponse } from '../../../common/utils/tests/setup/testNotifyResponses'
import { logger } from '../../../common/sharedServices/logger'

jest.mock('notifications-node-client', () => ({
  NotifyClient: jest.fn().mockImplementation(() => {
    return { sendEmail: mockSendEmail }
  })
}))
jest.mock(
  '../../../common/sharedServices/secrets/retrieveNotifyApiSecrets',
  () => ({
    retrieveNotifySecrets: jest.fn()
  })
)

const mockRetrieveNotifySecrets = retrieveNotifySecrets as jest.Mock
const mockSendEmail = jest.fn()

const givenNotifySecretsAvailable = () => {
  mockRetrieveNotifySecrets.mockResolvedValue(ALL_NOTIFY_SECRETS)
}
const givenNotifySecretsUnavailable = () => {
  mockRetrieveNotifySecrets.mockImplementation(() => {
    throw Error('Notify secrets not available')
  })
}
const givenSuccessfulSendEmailRequest = () => {
  mockSendEmail.mockResolvedValue(testSuccessfulNotifyResponse)
}
const givenUnsuccessfulSendEmailRequest = () => {
  mockSendEmail.mockImplementation(() => {
    throw new Error('A Notify related error')
  })
}
const requestDetails = {
  email: TEST_NOTIFY_EMAIL,
  firstName: TEST_NOTIFY_NAME,
  zendeskId: TEST_ZENDESK_TICKET_ID,
  secureDownloadUrl: TEST_SECURE_DOWNLOAD_URL
}

describe('sendEmailToNotify', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('given correct parameters, sends an email and logs the response information', async () => {
    jest.spyOn(logger, 'info')
    process.env.USE_NOTIFY_MOCK_SERVER = 'false'
    givenNotifySecretsAvailable()
    givenSuccessfulSendEmailRequest()

    await sendEmailToNotify(requestDetails)

    expect(NotifyClient).toHaveBeenCalledWith(ALL_NOTIFY_SECRETS.notifyApiKey)
    expect(mockSendEmail).toHaveBeenCalledTimes(1)
    expect(mockSendEmail).toHaveBeenCalledWith(
      ALL_NOTIFY_SECRETS.notifyTemplateId,
      TEST_NOTIFY_EMAIL,
      {
        personalisation: {
          firstName: TEST_NOTIFY_NAME,
          zendeskId: TEST_ZENDESK_TICKET_ID,
          secureDownloadUrl: TEST_SECURE_DOWNLOAD_URL
        },
        reference: TEST_ZENDESK_TICKET_ID
      }
    )
    expect(logger.info).toHaveBeenLastCalledWith(
      'Finished sending email with Notify API',
      {
        notifyResponseId: TEST_NOTIFY_RESPONSE_ID
      }
    )
  })

  it('given correct parameters and mock server enabled, uses mock server base URL', async () => {
    jest.spyOn(logger, 'info')
    process.env.USE_NOTIFY_MOCK_SERVER = 'true'
    process.env.MOCK_SERVER_BASE_URL = 'http://mock-server'
    givenNotifySecretsAvailable()
    givenSuccessfulSendEmailRequest()

    await sendEmailToNotify(requestDetails)

    expect(NotifyClient).toHaveBeenCalledWith(
      'http://mock-server',
      ALL_NOTIFY_SECRETS.notifyApiKey
    )
  })

  it('given correct parameters and send email fails an error is thrown', async () => {
    process.env.USE_NOTIFY_MOCK_SERVER = 'false'
    givenNotifySecretsAvailable()
    givenUnsuccessfulSendEmailRequest()

    await expect(sendEmailToNotify(requestDetails)).rejects.toThrow(
      'A Notify related error'
    )
  })

  it('given correct parameters and no secrets are available, an error is thrown', async () => {
    process.env.USE_NOTIFY_MOCK_SERVER = 'false'
    givenNotifySecretsUnavailable()

    await expect(sendEmailToNotify(requestDetails)).rejects.toThrow(
      'Notify secrets not available'
    )
  })
})
