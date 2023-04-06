import { AxiosResponse } from 'axios'
import { sendRequest } from '../../shared-test-code/utils/request/sendRequest'
import crypto from 'crypto'
import { getIntegrationTestEnvironmentVariable } from '../../shared-test-code/utils/getIntegrationTestEnvironmentVariable'
import { pollNotifyMockForDownloadUrl } from '../../shared-test-code/utils/notify/pollNotifyMockForDownloadUrl'
import { SQSPayload } from '../../shared-test-code/types/sqsPayload'
import { invokeSQSOperationsLambda } from '../../shared-test-code/utils/aws/invokeSQSOperationsLambdaFunction'
import { retrieveS3LinkFromHtml } from '../../shared-test-code/utils/retrieveS3LinkFromHtml'

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
        zendeskId: zendeskId,
        recipientEmail: getIntegrationTestEnvironmentVariable('EMAIL_RECIPIENT')
      }),
      queueUrl: getIntegrationTestEnvironmentVariable(
        'INTEGRATION_TESTS_TRIGGER_QUEUE_URL'
      )
    }
    await invokeSQSOperationsLambda(payload)
  })

  it('API should return success with downloadable link until there are no downloads remaining', async () => {
    const downloadUrl = await pollNotifyMockForDownloadUrl(zendeskId)

    // Download 1
    const firstGetResponse = await sendRequest(downloadUrl, 'GET')
    expect(firstGetResponse.status).toEqual(200)
    assertSecurityHeadersSet(firstGetResponse)
    const contentType = firstGetResponse.headers['content-type']
    expect(contentType).toEqual('text/html')
    expect(firstGetResponse.data).toContain('Download the report')
    expect(firstGetResponse.data).toContain(`You have 2 downloads remaining`)

    const firstDownloadResponse = await sendRequest(downloadUrl, 'POST')
    expect(firstDownloadResponse.status).toEqual(200)

    const s3Link = retrieveS3LinkFromHtml(firstDownloadResponse.data)
    const fileDownloadResponse = await sendRequest(s3Link, 'GET')
    expect(fileDownloadResponse.status).toEqual(200)
    expect(fileDownloadResponse.data as string).toEqual(fileContents)

    // Download 2
    const secondGetResponse = await sendRequest(downloadUrl, 'GET')
    expect(secondGetResponse.status).toEqual(200)
    expect(secondGetResponse.data).toContain(`You have 1 download remaining`)
    const secondDownloadResponse = await sendRequest(downloadUrl, 'POST')
    expect(secondDownloadResponse.status).toEqual(200)

    const secondS3Link = retrieveS3LinkFromHtml(secondDownloadResponse.data)
    const secondFileDownloadResponse = await sendRequest(secondS3Link, 'GET')
    expect(secondFileDownloadResponse.status).toEqual(200)
    expect(secondFileDownloadResponse.data as string).toEqual(fileContents)

    // Download 3
    const thirdGetResponse = await sendRequest(downloadUrl, 'GET')
    assertDownloadNotFoundResponse(thirdGetResponse)
    const thirdDownloadResponse = await sendRequest(downloadUrl, 'POST')
    assertDownloadNotFoundResponse(thirdDownloadResponse)
    assertSecurityHeadersSet(thirdDownloadResponse)
  })

  it('API should return a 404 when no record is available for the provided hash', async () => {
    const urlWithNonExistentHash = `${getIntegrationTestEnvironmentVariable(
      'SECURE_DOWNLOAD_BASE_URL'
    )}/xxxx-yyyy-zzzz`
    const response = await sendRequest(urlWithNonExistentHash, 'GET')
    assertDownloadNotFoundResponse(response)
    assertSecurityHeadersSet(response)
  })

  const assertDownloadNotFoundResponse = (response: AxiosResponse) => {
    expect(response.status).toEqual(404)
    expect(response.data).toEqual('')
  }

  const assertSecurityHeadersSet = (result: AxiosResponse) => {
    expect(
      result.headers && result.headers['strict-transport-security']
    ).toEqual('max-age=31536000; includeSubDomains; preload')

    expect(result.headers && result.headers['x-frame-options']).toEqual('DENY')
  }
})
