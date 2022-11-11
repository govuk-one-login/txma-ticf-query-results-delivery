import {
  TEST_NOTIFY_EMAIL,
  TEST_NOTIFY_NAME,
  TEST_SECURE_DOWNLOAD_URL,
  TEST_ZENDESK_TICKET_ID
} from '../../utils/tests/setup/testConstants'
import { handler } from './handler'
import { sendEmailToNotify } from './sendEmailToNotify'
import { constructSqsEvent } from '../../utils/tests/events/sqsEvent'
import { sendMessageToCloseTicketQueue } from './sendMessageToCloseTicketQueue'

jest.mock('./sendEmailToNotify', () => ({
  sendEmailToNotify: jest.fn()
}))

jest.mock('./sendMessageToCloseTicketQueue', () => ({
  sendMessageToCloseTicketQueue: jest.fn()
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
      "zendeskId": "${TEST_ZENDESK_TICKET_ID}",
      "secureDownloadUrl": "${TEST_SECURE_DOWNLOAD_URL}"
    }`

const callHandlerWithBody = async (customBody: string) => {
  await handler(constructSqsEvent(customBody))
}
const successfulCommentCopyReference = 'linkToResults'
const unsuccessfulCommentCopyReference = 'resultNotEmailed'

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
      zendeskId: TEST_ZENDESK_TICKET_ID,
      secureDownloadUrl: TEST_SECURE_DOWNLOAD_URL
    })
    expect(sendMessageToCloseTicketQueue).toHaveBeenCalledWith(
      TEST_ZENDESK_TICKET_ID,
      successfulCommentCopyReference
    )
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
    'logs an error when %p is missing from the event body',
    async (missingPropertyName: string) => {
      const eventBodyParams = {
        email: TEST_NOTIFY_EMAIL,
        firstName: TEST_NOTIFY_NAME,
        secureDownloadUrl: TEST_SECURE_DOWNLOAD_URL,
        zendeskId: TEST_ZENDESK_TICKET_ID
      } as { [key: string]: string }
      delete eventBodyParams[missingPropertyName]

      await callHandlerWithBody(JSON.stringify(eventBodyParams))

      expect(console.error).toHaveBeenCalledWith(
        'Could not send a request to Notify: ',
        Error('Required details were not all present in event body')
      )
      expect(sendMessageToCloseTicketQueue).toHaveBeenCalledWith(
        TEST_ZENDESK_TICKET_ID,
        unsuccessfulCommentCopyReference
      )
    }
  )
  it.each(['firstName', 'email', 'secureDownloadUrl'])(
    'logs an error when %p is an empty string',
    async (emptyStringPropertyName: string) => {
      const eventBodyParams = {
        email: TEST_NOTIFY_EMAIL,
        firstName: TEST_NOTIFY_NAME,
        secureDownloadUrl: TEST_SECURE_DOWNLOAD_URL,
        zendeskId: TEST_ZENDESK_TICKET_ID
      } as { [key: string]: string }
      eventBodyParams[emptyStringPropertyName] = ''

      await callHandlerWithBody(JSON.stringify(eventBodyParams))

      expect(console.error).toHaveBeenCalledWith(
        'Could not send a request to Notify: ',
        Error('Required details were not all present in event body')
      )
      expect(sendMessageToCloseTicketQueue).toHaveBeenCalledWith(
        TEST_ZENDESK_TICKET_ID,
        unsuccessfulCommentCopyReference
      )
    }
  )
  it('given a valid event body, when sendEmailToNotify fails, logs an error', async () => {
    givenUnsuccessfulSendEmailToNotify()

    await callHandlerWithBody(validEventBody)

    expect(console.error).toHaveBeenCalledWith(
      'Could not send a request to Notify: ',
      Error('A Notify related error')
    )
    expect(sendMessageToCloseTicketQueue).toHaveBeenCalledWith(
      TEST_ZENDESK_TICKET_ID,
      unsuccessfulCommentCopyReference
    )
  })
})
