import { AxiosResponse } from 'axios'
import { getIntegrationTestEnvironmentVariable } from './utils/getIntegrationTestEnvironmentVariable'
import crypto from 'crypto'
import { TriggerEndOfFlowSQSPayload } from './utils/types/sqsPayload'
import { invokeSQSOperationsLambda } from './utils/aws/invokeSQSOperationsLambdaFunction'
import { sendRequestForHash } from './utils/request/sendRequest'

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
      // TODO: get the download hash generated from above from the notify mock
      const downloadHash = '' //callToNotifyMock()

      // TODO: send the request for the hash
      const response = await sendRequestForHash('GET', downloadHash)
      expect(response.status).toEqual(200)
      const contentType = response.headers['content-type']
      expect(contentType).toEqual('text/html')
      expect(response.data).toContain('Download the report')
      expect(response.data).toContain('You have 3 downloads remaining.')
    })

    it('should not be possible to download the results file more than the max downloads allowed', async () => {
      // TODO: get the download hash generated from above from the notify mock
      const downloadHash = '' //callToNotifyMock()

      let response = null
      for (let i = 3; i >= 1; i--) {
        response = await sendRequestForHash('GET', downloadHash)
        if (i > 1) {
          expect(response.status).toEqual(200)
          expect(response.headers['content-type']).toEqual('text/html')
          expect(response.data).toContain(`You have ${i} downloads remaining`)
        } else {
          assertDownloadNotFoundResponse(response)
        }
      }
    })
  })

  describe('Download warning page - download error', () => {
    it('should return a 404 when no record is available for the provided hash', async () => {
      const nonExistentHash = crypto.randomUUID()
      const response = await sendRequestForHash('GET', nonExistentHash)
      assertDownloadNotFoundResponse(response)
    })

    it('should return a 404 when created date is lapsed from today', async () => {
      //TODO: is this still possible from within tests?
      const EXPIRED_HASH = ''
      const response = await sendRequestForHash('GET', EXPIRED_HASH)
      assertDownloadNotFoundResponse(response)
    })
  })
})
