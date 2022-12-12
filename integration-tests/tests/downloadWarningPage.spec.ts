import { AxiosResponse } from 'axios'
import { getIntegrationTestEnvironmentVariable } from './utils/getIntegrationTestEnvironmentVariable'
import crypto from 'crypto'
import { TriggerEndOfFlowSQSPayload } from './utils/types/sqsPayload'
import { invokeSQSOperationsLambda } from './utils/aws/invokeSQSOperationsLambdaFunction'
import { sendRequest } from './utils/request/sendRequest'
import { pollNotifyMockForDownloadUrl } from './utils/notify/pollNotifyMockForDownloadUrl'

describe('Download pages', () => {
  const assertDownloadNotFoundResponse = (response: AxiosResponse) => {
    expect(response.status).toEqual(404)
    expect(response.data).toEqual('')
  }

  describe('Download warning page - successful download', () => {
    let randomId = ''
    let fileContents = ''
    let zendeskId = ''

    beforeEach(async () => {
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

    it('A GET should return a success response with correct max downloads when called for the first time', async () => {
      const downloadUrl = await pollNotifyMockForDownloadUrl(zendeskId)

      const response = await sendRequest(downloadUrl, 'GET')
      expect(response.status).toEqual(200)
      const contentType = response.headers['content-type']
      expect(contentType).toEqual('text/html')
      expect(response.data).toContain('Download the report')
      expect(response.data).toContain('You have 3 downloads remaining.')
    })

    it('A GET should return a 404 when no record is available for the provided hash', async () => {
      const urlWithNonExistentHash = `https://${getIntegrationTestEnvironmentVariable(
        'SECURE_DOWNLOAD_BASE_URL'
      )}/secure/xxxx-yyyy-zzzz`
      const response = await sendRequest(urlWithNonExistentHash, 'GET')
      assertDownloadNotFoundResponse(response)
    })
  })
})
