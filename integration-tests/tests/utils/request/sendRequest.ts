import axios, { AxiosPromise } from 'axios'
import { getIntegrationTestEnvironmentVariable } from '../getIntegrationTestEnvironmentVariable'

export const sendRequestForHash = (
  method: string,
  hash: string
): AxiosPromise => {
  return sendRequest(
    `${getIntegrationTestEnvironmentVariable(
      'DOWNLOAD_PAGE_BASE_URL'
    )}/secure/${hash}`,
    method
  )
}

export const sendRequest = (url: string, method: string) => {
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
