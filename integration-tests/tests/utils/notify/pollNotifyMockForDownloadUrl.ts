import axios from 'axios'
import { getIntegrationTestEnvironmentVariable } from '../getIntegrationTestEnvironmentVariable'

export const pollNotifyMockForDownloadUrl = async (zendeskId: string) => {
  const maxAttempts = 30
  let attempts = 0
  let url = undefined
  while (!url && attempts < maxAttempts) {
    attempts++
    url = await getDownloadUrlFromNotifyMock(zendeskId)
    await pause(3000)
  }

  if (!url) {
    throw new Error(
      `Mock server did not return a URL after ${maxAttempts} attempts`
    )
  } else {
    return url
  }
}

const getDownloadUrlFromNotifyMock = async (zendeskId: string) => {
  const url = `${getIntegrationTestEnvironmentVariable(
    'NOTIFY_MOCK_SERVER_BASE_URL'
  )}/notifyrequest/${zendeskId}`

  console.log('MOCK SERVER', url)

  const response = await axios({
    url: url,
    method: 'GET',
    headers: { Accept: 'application/json' },

    // Regardless of HTTP status code, we can just assert below without
    // having to try/catch.
    validateStatus: () => true
  })
  return response?.data?.secureDownloadUrl
}

const pause = async (delay: number) => {
  return new Promise((r) => setTimeout(r, delay))
}
