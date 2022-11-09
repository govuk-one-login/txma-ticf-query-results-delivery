import {
  TEST_NOTIFY_EMAIL,
  TEST_NOTIFY_NAME,
  TEST_SECURE_DOWNLOAD_URL,
  ZENDESK_TICKET_ID
} from '../../utils/tests/setup/testConstants'
import { handler } from './handler'
import { sendEmailToNotify } from './sendEmailToNotify'
import { constructSqsEvent } from '../../utils/tests/events/sqsEvent'

jest.mock('./sendEmailToNotify', () => ({
  sendEmailToNotify: jest.fn()
}))
jest.mock('../../sharedServices/queue/sendSqsMessage', () => ({
  sendSqsMessage: jest.fn()
}))

const mockSendEmailToNotify = sendEmailToNotify as jest.Mock

const givenUnsuccessfulSendEmailToNotify = () => {
  mockSendEmailToNotify.mockImplementation(() => {
    throw new Error('A Notify related error')
  })
}

const validEventBody = `{
      "email": "${TEST_NOTIFY_EMAIL}",
      "firstName": "${TEST_NOTIFY_NAME}",
      "zendeskId": "${ZENDESK_TICKET_ID}",
      "secureDownloadUrl": "${TEST_SECURE_DOWNLOAD_URL}"
    }`

const callHandlerWithBody = async (customBody: string) => {
  await handler(constructSqsEvent(customBody))
}

describe('initiate sendEmailRequest handler', () => {
  beforeEach(() => {
    jest.spyOn(global.console, 'error')
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('creates a NotifyClient and calls sendEmail with correct parameters', async () => {
    await callHandlerWithBody(validEventBody)

    expect(mockSendEmailToNotify).toHaveBeenCalledWith({
      email: TEST_NOTIFY_EMAIL,
      firstName: TEST_NOTIFY_NAME,
      zendeskId: ZENDESK_TICKET_ID,
      secureDownloadUrl: TEST_SECURE_DOWNLOAD_URL
    })
  })

  it('throws an error when no event records are in the SQSEvent object', async () => {
    await expect(handler({ Records: [] })).rejects.toThrow(
      'No records found in event'
    )
  })

  it('throws an error when no event body is present', async () => {
    const invalidEventBody = ''

    await expect(callHandlerWithBody(invalidEventBody)).rejects.toThrow(
      'Could not find event body. An email has not been sent'
    )
  })
  it('throws an error when zendeskId is missing from the event body', async () => {
    const eventBodyParams = JSON.stringify({
      email: TEST_NOTIFY_EMAIL,
      firstName: TEST_NOTIFY_NAME,
      secureDownloadUrl: TEST_SECURE_DOWNLOAD_URL
    })

    await expect(callHandlerWithBody(eventBodyParams)).rejects.toThrow(
      'Zendesk ticket ID missing from event body'
    )
  })
  it('throws an error when zendeskId is an empty string', async () => {
    const eventBodyParams = JSON.stringify({
      email: TEST_NOTIFY_EMAIL,
      firstName: TEST_NOTIFY_NAME,
      secureDownloadUrl: TEST_SECURE_DOWNLOAD_URL,
      zendeskId: ''
    })

    await expect(callHandlerWithBody(eventBodyParams)).rejects.toThrow(
      'Zendesk ticket ID missing from event body'
    )
  })
  it.each(['firstName', 'email', 'secureDownloadUrl'])(
    'throws an error when %p is missing from the event body',
    async (missingPropertyName: string) => {
      const eventBodyParams = {
        email: TEST_NOTIFY_EMAIL,
        firstName: TEST_NOTIFY_NAME,
        secureDownloadUrl: TEST_SECURE_DOWNLOAD_URL,
        zendeskId: ZENDESK_TICKET_ID
      } as { [key: string]: string }
      delete eventBodyParams[missingPropertyName]

      await callHandlerWithBody(JSON.stringify(eventBodyParams))

      expect(console.error).toHaveBeenCalledWith()
    }
  )
  it.each(['firstName', 'email', 'secureDownloadUrl'])(
    'updates Zendesk ticket, and throws an error when %p is an empty string',
    async (emptyStringPropertyName: string) => {
      const eventBodyParams = {
        email: TEST_NOTIFY_EMAIL,
        firstName: TEST_NOTIFY_NAME,
        secureDownloadUrl: TEST_SECURE_DOWNLOAD_URL,
        zendeskId: ZENDESK_TICKET_ID
      } as { [key: string]: string }
      eventBodyParams[emptyStringPropertyName] = ''

      await expect(
        callHandlerWithBody(JSON.stringify(eventBodyParams))
      ).rejects.toThrow('Required details were not all present in event body')
    }
  )
  it('given a valid event body, when sendEmailToNotify fails, logs an error and calls closeZendeskTicket', async () => {
    givenUnsuccessfulSendEmailToNotify()

    await callHandlerWithBody(validEventBody)

    expect(console.error).toHaveBeenCalledWith(
      'Could not send a request to Notify: ',
      JSON.stringify(Error('A Notify related error'))
    )
  })
  it('given valid event body and Notify request was successful, it logs an error when updateZendeskTicketById fails', async () => {
    await callHandlerWithBody(validEventBody)

    expect(mockSendEmailToNotify).toHaveBeenCalledWith({
      email: TEST_NOTIFY_EMAIL,
      firstName: TEST_NOTIFY_NAME,
      zendeskId: ZENDESK_TICKET_ID,
      secureDownloadUrl: TEST_SECURE_DOWNLOAD_URL
    })
    expect(console.error).toHaveBeenCalledWith(
      'Could not update Zendesk ticket: ',
      Error('An updateZendeskTicket related error')
    )
  })
  it('given a valid event body, when sendEmailToNotify and updateZendeskTicketById fails, both errors are logged', async () => {
    givenUnsuccessfulSendEmailToNotify()

    await callHandlerWithBody(validEventBody)

    expect(console.error).toHaveBeenCalledTimes(2)
    expect(console.error).toHaveBeenNthCalledWith(
      1,
      'Could not send a request to Notify: ',
      JSON.stringify(Error('A Notify related error'))
    )
    expect(console.error).toHaveBeenLastCalledWith(
      'Could not update Zendesk ticket: ',
      Error('An updateZendeskTicket related error')
    )
  })
})
