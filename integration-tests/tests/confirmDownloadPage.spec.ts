import { AxiosResponse } from 'axios'
import { sendRequest } from './utils/request/sendRequest'
import { parse } from 'node-html-parser'
import crypto from 'crypto'
import { TriggerEndOfFlowSQSPayload } from './utils/types/sqsPayload'
import { getIntegrationTestEnvironmentVariable } from './utils/getIntegrationTestEnvironmentVariable'
import { invokeSQSOperationsLambda } from './utils/aws/invokeSQSOperationsLambdaFunction'
import { pollNotifyMockForDownloadUrl } from './utils/notify/pollNotifyMockForDownloadUrl'

describe('Confirm download page', () => {
  let randomId = ''
  let fileContents = ''

  beforeEach(async () => {
    randomId = crypto.randomUUID()
    fileContents = crypto.randomUUID()

    const payload: TriggerEndOfFlowSQSPayload = {
      message: { athenaQueryId: randomId, fileContents: fileContents },
      queueUrl: getIntegrationTestEnvironmentVariable(
        'INTEGRATION_TESTS_TRIGGER_QUEUE_URL'
      )
    }
    await invokeSQSOperationsLambda(payload)
  })

  it('should return a success response when download url is valid', async () => {
    const downloadUrl = await pollNotifyMockForDownloadUrl(randomId)

    const response = await sendRequest(downloadUrl, 'POST')
    expect(response.status).toEqual(200)

    const fileDownloadResponse = await sendRequest(
      retrieveS3LinkFromHtml(response.data),
      'GET'
    )
    expect(fileDownloadResponse.status).toEqual(200)
    expect(fileDownloadResponse.data as string).toEqual(fileContents)

    const getResponseAfterDownload = await sendRequest(downloadUrl, 'GET')
    expect(getResponseAfterDownload.status).toEqual(200)
    expect(getResponseAfterDownload.data).toContain(
      'You have 2 downloads remaining.'
    )
  })

  it('should return a 404 when there are no downloads remaining', async () => {
    const downloadUrl = await pollNotifyMockForDownloadUrl(randomId)

    const response = await sendRequest(downloadUrl, 'POST')
    expect(response.status).toEqual(200)

    let fileDownloadResponse = null
    let getResponse = null
    const s3Link = retrieveS3LinkFromHtml(response.data)
    fileDownloadResponse = await sendRequest(s3Link, 'GET')
    expect(fileDownloadResponse.status).toEqual(200)
    expect(fileDownloadResponse.data as string).toEqual(fileContents)

    for (let i = 2; i >= 0; i--) {
      getResponse = await sendRequest(downloadUrl, 'GET')

      if (i > 0) {
        expect(getResponse.status).toEqual(200)
        expect(getResponse.data).toContain(
          `You have ${i - 1} downloads remaining`
        )
      } else {
        assertDownloadNotFoundResponse(getResponse)
      }
    }
  })

  it('should return a 404 when no record is available for the provided hash', async () => {
    const downloadUrl = await pollNotifyMockForDownloadUrl(randomId)

    const urlWithNonExistentHash = replaceHashInUrl(
      downloadUrl,
      'xxxx-yyyy-zzzz'
    )
    const response = await sendRequest(urlWithNonExistentHash, 'POST')
    assertDownloadNotFoundResponse(response)
  })

  const assertDownloadNotFoundResponse = (response: AxiosResponse) => {
    expect(response.status).toEqual(404)
    expect(response.data).toEqual('')
  }

  const replaceHashInUrl = (url: string, replacementHash: string) => {
    const regex = /secure\/[a-z0-9-]+/
    return url.replace(regex, replacementHash)
  }

  const retrieveS3LinkFromHtml = (htmlBody: string): string => {
    const htmlRoot = parse(htmlBody)
    const metaTag = htmlRoot.querySelector('meta[http-equiv="refresh"]')
    const contentAttribute = metaTag?.attributes['content'] as string
    expect(contentAttribute).toBeDefined()

    const urlMatch = contentAttribute.match(/url=(.*)/)
    const url = urlMatch ? urlMatch[1] : undefined
    expect(url).toBeDefined()
    return url as string
  }
})
