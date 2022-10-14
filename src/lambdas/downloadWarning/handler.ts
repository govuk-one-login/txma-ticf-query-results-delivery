import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda'
import { getDownloadAvailabilityResult } from '../../sharedServices/getDownloadAvailabilityResult'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('received request', event)
    if (!event.pathParameters || !event.pathParameters.downloadHash) {
      return invalidParametersResponse()
    }
    const fraudDataResponse = await getDownloadAvailabilityResult(
      event.pathParameters.downloadHash as string
    )
    if (!fraudDataResponse.hasAvailableDownload) {
      return notFoundResponse()
    }

    return downloadConfirmResponse()
  } catch (err) {
    console.error(err)
    return serverErrorResponse()
  }
}

const invalidParametersResponse = () => {
  console.warn(
    'Returning 400 response because path parameter downloadHash not found in request'
  )
  return {
    statusCode: 400,
    body: '<html><body>Invalid parameters</body></html>',
    headers: {
      'Content-type': 'text/html'
    }
  }
}
const notFoundResponse = () => {
  console.warn('Returning 404 response because no download record was found')
  return htmlResponse(404, '<html><body>Download not found</body></html>')
}

const downloadConfirmResponse = () => {
  const body = `<html>
  <header>
  <title>Download TICF analyst data</title>
  </header>
  <body>
      <h1>TiCF analyst data download</h1>
      <p>Downloading data from this page is for authorised people. If this is not you, please close this page immediately.</p>
      <p>If you are authorised to download the data please click the link below.</p>
      <form method="POST">
      <input type="submit" value="Download Data">
      </form>
  </body>
  </html>`
  return htmlResponse(200, body)
}

const serverErrorResponse = () => {
  return htmlResponse(
    500,
    '<html><body>There was an error processing your request</body></html>'
  )
}

const htmlResponse = (statusCode: number, body: string) => {
  return {
    statusCode: statusCode,
    body: body,
    headers: {
      'Content-type': 'text/html'
    }
  }
}
