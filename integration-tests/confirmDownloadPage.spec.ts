import { AxiosResponse } from 'axios'
import { sendRequest, sendRequestForHash } from './utils/request/sendRequest'
import { parse } from 'node-html-parser'

const NON_EXISTENT_HASH = 'aHashThatShouldNotExist'
const VALID_HASH = 'integrationTestHash'
const EXPIRED_HASH = 'lapsed'
const HASH_WITH_NO_DOWNLOADS_REMAINING =
  'integrationTest-noDownloadsRemainingHash'

const assertDownloadNotFoundResponse = (response: AxiosResponse) => {
  expect(response.status).toEqual(404)
  expect(response.data).toEqual('')
}

describe('Confirm download page', () => {
  it('should return a 404 when no record is available for the provided hash', async () => {
    const response = await sendRequestForHash('POST', NON_EXISTENT_HASH)
    assertDownloadNotFoundResponse(response)
  })

  it('should return a 404 when created date is lapsed from today', async () => {
    const response = await sendRequestForHash('POST', EXPIRED_HASH)
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

    const getResponseAfterDownload = await sendRequestForHash('GET', VALID_HASH)
    expect(getResponseAfterDownload.status).toEqual(200)
    expect(getResponseAfterDownload.data).toContain(
      'You have 2 downloads remaining.'
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
