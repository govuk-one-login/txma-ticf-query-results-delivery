import axios, { AxiosPromise } from 'axios'
import { createOrUpdateDbHashRecord } from './utils/aws/createOrUpdateDbHashRecord'
import { getIntegrationTestEnvironmentVariable } from './utils/getIntegrationTestEnvironmentVariable'

const sendRequestForHash = (method: string, hash: string): AxiosPromise => {
  return axios({
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

describe('Download warning', () => {
  it('should return a 404 when no record is available for the provided hash', async () => {
    const response = await sendRequestForHash('GET', 'aHashThatShouldNotExist')
    expect(response.status).toEqual(404)
    const contentType = response.headers['content-type']
    expect(contentType).toEqual('text/html')
    expect(response.data).toContain('Download not found')
  })

  it('should return a success response when there is a record for the provided hash', async () => {
    const testHash = 'integrationTestHash'
    await createOrUpdateDbHashRecord(testHash)

    const response = await sendRequestForHash('GET', testHash)
    expect(response.status).toEqual(200)
    const contentType = response.headers['content-type']
    expect(contentType).toEqual('text/html')
    expect(response.data).toContain(
      '<input type="submit" value="Download Data">'
    )
    expect(response.data).toContain('You have 3 downloads remaining')
  })
})
