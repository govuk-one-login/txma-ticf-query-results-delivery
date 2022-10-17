import axios, { AxiosPromise } from 'axios'
import { createOrUpdateDbHashRecord } from './utils/aws/createOrUpdateDbHashRecord'
import { getIntegrationTestEnvironmentVariable } from './utils/getIntegrationTestEnvironmentVariable'

const sendRequestForHash = (method: string, hash: string): AxiosPromise => {
  return axios({
    // Some of our responses contain a redirect, which we don't want to follow,
    // just need to examine the contents of the Location header
    maxRedirects: 0,
    validateStatus: function () {
      // Will never throw errors, regardless of HTTP status code, so we can just assert below without
      // having to try/catch.
      return true
    },
    url: `${getIntegrationTestEnvironmentVariable(
      'DOWNLOAD_PAGE_BASE_URL'
    )}/secure/${hash}`,
    method: method
  })
}

const NON_EXISTENT_HASH = 'aHashThatShouldNotExist'
const VALID_HASH = 'myValidHash'
describe('Download pages', () => {
  beforeAll(async () => {
    await createOrUpdateDbHashRecord(VALID_HASH)
  })

  describe('Download warning page', () => {
    it('should return a 404 when no record is available for the provided hash', async () => {
      const response = await sendRequestForHash('GET', NON_EXISTENT_HASH)
      expect(response.status).toEqual(404)
      const contentType = response.headers['content-type']
      expect(contentType).toEqual('text/html')
      expect(response.data).toContain('Download not found')
    })

    it('should return a success response when there is a record for the provided hash', async () => {
      const response = await sendRequestForHash('GET', VALID_HASH)
      expect(response.status).toEqual(200)
      const contentType = response.headers['content-type']
      expect(contentType).toEqual('text/html')
      expect(response.data).toContain(
        '<input type="submit" value="Download Data">'
      )
      expect(response.data).toContain('You have 3 downloads remaining')
    })
  })

  describe('Confirm download page', () => {
    it('should return a 404 when no record is available for the provided hash', async () => {
      const response = await sendRequestForHash('POST', NON_EXISTENT_HASH)
      expect(response.status).toEqual(404)
      const contentType = response.headers['content-type']
      expect(contentType).toEqual('text/html')
      expect(response.data).toContain('Download not found')
    })

    it('should return a success response when there is a record for the provided hash', async () => {
      const response = await sendRequestForHash('POST', VALID_HASH)
      expect(response.status).toEqual(301)
      const locationHeader = response.headers['location']
      expect(locationHeader).toContain('https')
    })
  })
})
