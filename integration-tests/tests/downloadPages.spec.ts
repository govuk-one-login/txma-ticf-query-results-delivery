import { AxiosResponse } from 'axios'
import { sendRequest } from './utils/request/sendRequest'
import { parse } from 'node-html-parser'
import crypto from 'crypto'
import { TriggerEndOfFlowSQSPayload } from './utils/types/sqsPayload'
import { getIntegrationTestEnvironmentVariable } from './utils/getIntegrationTestEnvironmentVariable'
import { invokeSQSOperationsLambda } from './utils/aws/invokeSQSOperationsLambdaFunction'
import { pollNotifyMockForDownloadUrl } from './utils/notify/pollNotifyMockForDownloadUrl'

describe('Download pages', () => {
  let randomId = ''
  let fileContents = ''
  let zendeskId = ''

  beforeAll(async () => {
    randomId = crypto.randomUUID()
    fileContents = crypto.randomUUID()
    zendeskId = Date.now().toString()

    const payload: TriggerEndOfFlowSQSPayload = {
      message: {
        athenaQueryId: randomId,
        fileContents: fileContents,
        zendeskId: zendeskId
      },
      queueUrl: getIntegrationTestEnvironmentVariable(
        'INTEGRATION_TESTS_TRIGGER_QUEUE_URL'
      )
    }
    await invokeSQSOperationsLambda(payload)
  })

  it('API should return success with downloadable link until there are no downloads remaining', async () => {
    const downloadUrl = await pollNotifyMockForDownloadUrl(zendeskId)
    const maxDownloads = 2

    const getResponse = await sendRequest(downloadUrl, 'GET')
    expect(getResponse.status).toEqual(200)
    const contentType = getResponse.headers['content-type']
    expect(contentType).toEqual('text/html')
    expect(getResponse.data).toContain('Download the report')
    expect(getResponse.data).toContain(
      `You have ${maxDownloads} downloads remaining`
    )

    let postResponse,
      fileDownloadResponse = null

    for (let i = maxDownloads; i >= 0; i--) {
      postResponse = await sendRequest(downloadUrl, 'POST')

      if (i > 0) {
        expect(postResponse.status).toEqual(200)
        expect(postResponse.data).toContain(
          `You have ${i - 1} downloads remaining`
        )
        const s3Link = retrieveS3LinkFromHtml(postResponse.data)
        fileDownloadResponse = await sendRequest(s3Link, 'GET')
        expect(fileDownloadResponse.status).toEqual(200)
        expect(fileDownloadResponse.data as string).toEqual(fileContents)
      } else {
        assertDownloadNotFoundResponse(postResponse)
      }
    }
  })

  it('API should return a 404 when no record is available for the provided hash', async () => {
    const urlWithNonExistentHash = `https://${getIntegrationTestEnvironmentVariable(
      'SECURE_DOWNLOAD_BASE_URL'
    )}/secure/xxxx-yyyy-zzzz`
    const response = await sendRequest(urlWithNonExistentHash, 'GET')
    assertDownloadNotFoundResponse(response)
  })

  const assertDownloadNotFoundResponse = (response: AxiosResponse) => {
    expect(response.status).toEqual(404)
    expect(response.data).toEqual('')
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
