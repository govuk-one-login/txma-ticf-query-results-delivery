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
    let athenaQueryId = ''

    beforeEach(async () => {
      athenaQueryId = crypto.randomUUID()
      const payload: TriggerEndOfFlowSQSPayload = {
        message: `${athenaQueryId}.csv`,
        queueUrl: getIntegrationTestEnvironmentVariable(
          'INTEGRATION_TESTS_TRIGGER_QUEUE_URL'
        )
      }
      await invokeSQSOperationsLambda(payload)
    })

    it('should return a success response with correct max downloads when called for the first time', async () => {
      const downloadUrl = await pollNotifyMockForDownloadUrl(athenaQueryId)

      const response = await sendRequest(downloadUrl, 'GET')
      expect(response.status).toEqual(200)
      const contentType = response.headers['content-type']
      expect(contentType).toEqual('text/html')
      expect(response.data).toContain('Download the report')
      expect(response.data).toContain('You have 3 downloads remaining.')
    })

    it('should return a 404 when no record is available for the provided hash', async () => {
      const downloadUrl = await pollNotifyMockForDownloadUrl(athenaQueryId)

      const urlWithNonExistentHash = replaceHashInUrl(
        downloadUrl,
        'xxxx-yyyy-zzzz'
      )
      const response = await sendRequest(urlWithNonExistentHash, 'GET')
      assertDownloadNotFoundResponse(response)
    })

    const replaceHashInUrl = (url: string, replacementHash: string) => {
      const regex = /secure\/[a-z0-9-]+/
      return url.replace(regex, replacementHash)
    }
  })
})
