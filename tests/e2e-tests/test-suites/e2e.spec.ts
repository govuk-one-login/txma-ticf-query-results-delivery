import { sendRequest } from '../../shared-test-code/utils/request/sendRequest'
import crypto from 'crypto'
import { getIntegrationTestEnvironmentVariable } from '../../shared-test-code/utils/getIntegrationTestEnvironmentVariable'
import { SQSPayload } from '../../shared-test-code/types/sqsPayload'
import { invokeSQSOperationsLambda } from '../../shared-test-code/utils/aws/invokeSQSOperationsLambdaFunction'
import { pollNotifyApiForDownloadUrl } from '../../shared-test-code/utils/notify/pollNotifyApiForDownloadUrl'
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

  it('Should be able to download results', async () => {
    const downloadUrl = await pollNotifyApiForDownloadUrl(zendeskId)

    const firstGetResponse = await sendRequest(downloadUrl, 'GET')
    expect(firstGetResponse.status).toEqual(200)

    const firstDownloadResponse = await sendRequest(downloadUrl, 'POST')
    expect(firstDownloadResponse.status).toEqual(200)

    const s3Link = retrieveS3LinkFromHtml(firstDownloadResponse.data)
    const fileDownloadResponse = await sendRequest(s3Link, 'GET')
    expect(fileDownloadResponse.status).toEqual(200)
    expect(fileDownloadResponse.data as string).toEqual(fileContents)
  })
})
