import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda'
import { getDownloadAvailabilityResult } from '../../sharedServices/getDownloadAvailabilityResult'
import {
  htmlResponse,
  invalidParametersResponse,
  notFoundResponse,
  serverErrorResponse
} from '../../sharedServices/responseHelpers'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('received request', event)
    if (!event.pathParameters || !event.pathParameters.downloadHash) {
      return invalidParametersResponse()
    }
    const downloadAvailabilityResult = await getDownloadAvailabilityResult(
      event.pathParameters.downloadHash as string
    )
    if (!downloadAvailabilityResult.hasAvailableDownload) {
      return notFoundResponse()
    }

    return downloadConfirmResponse(
      downloadAvailabilityResult.downloadsRemaining as number
    )
  } catch (err) {
    console.error(err)
    return serverErrorResponse()
  }
}

const downloadConfirmResponse = (downloadsRemaining: number) => {
  const body = `<html>
  <header>
  <title>Download TICF analyst data</title>
  </header>
  <body>
      <h1>TiCF analyst data download</h1>
      <p>Downloading data from this page is for authorised people. If this is not you, please close this page immediately.</p>
      <p>If you are authorised to download the data please click the link below.</p>
      <p>You have ${downloadsRemaining} downloads remaining.</p>
      <form method="POST">
      <input type="submit" value="Download Data">
      </form>
  </body>
  </html>`
  return htmlResponse(200, body)
}
