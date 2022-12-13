import { AxiosResponse } from 'axios'
import { sendRequest } from './utils/request/sendRequest'
import { parse } from 'node-html-parser'
import crypto from 'crypto'
import { getIntegrationTestEnvironmentVariable } from './utils/getIntegrationTestEnvironmentVariable'
import { pollNotifyMockForDownloadUrl } from './utils/notify/pollNotifyMockForDownloadUrl'
import { SQSPayload } from './utils/types/sqsPayload'
import { invokeSQSOperationsLambda } from './utils/aws/invokeSQSOperationsLambdaFunction'

describe('Download pages', () => {
  let randomId = ''
  let fileContents = ''
  let zendeskId = ''

  beforeAll(async () => {
    randomId = fileContents = crypto.randomUUID()
    zendeskId = Date.now().toString()

    const payload: SQSPayload = {
      message: JSON.stringify({
        athenaQueryId: randomId,
        fileContents: fileContents,
        zendeskId: zendeskId
      }),
      queueUrl: getIntegrationTestEnvironmentVariable(
        'INTEGRATION_TESTS_TRIGGER_QUEUE_URL'
      )
    }
    await invokeSQSOperationsLambda(payload)
  })

  it('API should return success with downloadable link until there are no downloads remaining', async () => {
    const downloadUrl = await pollNotifyMockForDownloadUrl(zendeskId)
    const maxDownloads = 2

    let getResponse = await sendRequest(downloadUrl, 'GET')
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

        const s3Link = retrieveS3LinkFromHtml(postResponse.data)
        fileDownloadResponse = await sendRequest(s3Link, 'GET')
        expect(fileDownloadResponse.status).toEqual(200)
        expect(fileDownloadResponse.data as string).toEqual(fileContents)

        getResponse = await sendRequest(downloadUrl, 'GET')
        if (i > 1) {
          expect(getResponse.status).toEqual(200)
          expect(getResponse.data).toContain(
            `You have ${i - 1} download remaining`
          )
        } else {
          assertDownloadNotFoundResponse(getResponse)
        }
      } else {
        assertDownloadNotFoundResponse(postResponse)
      }
    }
  })

  it('API should return a 404 when no record is available for the provided hash', async () => {
    const urlWithNonExistentHash = `${getIntegrationTestEnvironmentVariable(
      'SECURE_DOWNLOAD_BASE_URL'
    )}/xxxx-yyyy-zzzz`
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
