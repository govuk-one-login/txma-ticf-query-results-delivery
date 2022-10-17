import axios, { AxiosPromise, AxiosResponse } from 'axios'
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
const VALID_HASH = 'integrationTestHash'
const HASH_WITH_NO_DOWNLOADS_REMAINING =
  'integrationTest-noDownloadsRemainingHash'
describe('Download pages', () => {
  const resetDatabase = async () => {
    await createOrUpdateDbHashRecord(VALID_HASH)
    await createOrUpdateDbHashRecord(HASH_WITH_NO_DOWNLOADS_REMAINING, 0)
  }

  const assertDownloadNotFoundResponse = (response: AxiosResponse) => {
    expect(response.status).toEqual(404)
    const contentType = response.headers['content-type']
    expect(contentType).toEqual('text/html')
    expect(response.data).toContain('Download not found')
  }

  describe('Download warning page', () => {
    beforeAll(async () => {
      await resetDatabase()
    })

    it('should return a 404 when no record is available for the provided hash', async () => {
      const response = await sendRequestForHash('GET', NON_EXISTENT_HASH)
      assertDownloadNotFoundResponse(response)
    })

    it('should return a 404 when there are no downloads remaining for the hash', async () => {
      const response = await sendRequestForHash(
        'GET',
        HASH_WITH_NO_DOWNLOADS_REMAINING
      )
      assertDownloadNotFoundResponse(response)
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
    beforeAll(async () => {
      await resetDatabase()
    })

    it('should return a 404 when no record is available for the provided hash', async () => {
      const response = await sendRequestForHash('POST', NON_EXISTENT_HASH)
      assertDownloadNotFoundResponse(response)
    })

    it('should return a 404 when there are no downloads remaining for the hash', async () => {
      const response = await sendRequestForHash(
        'GET',
        HASH_WITH_NO_DOWNLOADS_REMAINING
      )
      assertDownloadNotFoundResponse(response)
    })

    it('should return a success response when there is a record for the provided hash', async () => {
      const response = await sendRequestForHash('POST', VALID_HASH)
      expect(response.status).toEqual(301)
      const locationHeader = response.headers['location']
      expect(locationHeader).toContain('https')
      const getResponseAfterDownload = await sendRequestForHash(
        'GET',
        VALID_HASH
      )
      expect(getResponseAfterDownload.status).toEqual(200)
      expect(getResponseAfterDownload.data).toContain(
        'You have 2 downloads remaining'
      )
    })
  })
})
