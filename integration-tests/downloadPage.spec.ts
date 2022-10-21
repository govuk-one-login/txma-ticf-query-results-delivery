import axios, { AxiosPromise, AxiosResponse } from 'axios'
import { createOrUpdateDbHashRecord } from './utils/aws/createOrUpdateDbHashRecord'
import { getIntegrationTestEnvironmentVariable } from './utils/getIntegrationTestEnvironmentVariable'
import { parse } from 'node-html-parser'

const sendRequestForHash = (method: string, hash: string): AxiosPromise => {
  return sendRequest(
    `${getIntegrationTestEnvironmentVariable(
      'DOWNLOAD_PAGE_BASE_URL'
    )}/secure/${hash}`,
    method
  )
}

const sendRequest = (url: string, method: string) => {
  return axios({
    // Some of our responses contain a redirect, which we don't want to follow,
    // just need to examine the contents of the Location header
    maxRedirects: 0,
    validateStatus: function () {
      // Will never throw errors, regardless of HTTP status code, so we can just assert below without
      // having to try/catch.
      return true
    },
    url: url,
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
    expect(response.data).toEqual('')
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

    it('should return a success response with correct number of downloads when there is a record for the provided hash', async () => {
      const response = await sendRequestForHash('GET', VALID_HASH)
      expect(response.status).toEqual(200)
      const contentType = response.headers['content-type']
      expect(contentType).toEqual('text/html')
      expect(response.data).toContain('Download the report')
      expect(response.data).toContain(
        'You have 3 attempts before the link expires.'
      )
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
      expect(response.status).toEqual(200)

      const fileDownloadResponse = await sendRequest(
        retrieveS3LinkFromHtml(response.data),
        'GET'
      )

      expect(fileDownloadResponse.status).toEqual(200)

      const getResponseAfterDownload = await sendRequestForHash(
        'GET',
        VALID_HASH
      )
      expect(getResponseAfterDownload.status).toEqual(200)
      expect(getResponseAfterDownload.data).toContain(
        'You have 2 attempts before the link expires'
      )
    })

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
})
