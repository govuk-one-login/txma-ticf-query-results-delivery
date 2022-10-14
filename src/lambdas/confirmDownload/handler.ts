import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda'
import { getDownloadAvailabilityResult } from '../../sharedServices/getDownloadAvailabilityResult'
import { createTemporaryS3Link } from './createTemporaryS3Link'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('received request', JSON.stringify(event))
  try {
    if (!event.pathParameters || !event.pathParameters.downloadHash) {
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
    const fraudDataResponse = await getDownloadAvailabilityResult(
      event.pathParameters.downloadHash as string
    )

    if (!fraudDataResponse.hasAvailableDownload) {
      console.warn(
        'Returning 404 response because no download record was found'
      )
      return {
        statusCode: 404,
        body: '<html><body>Download not found</body></html>',
        headers: {
          'Content-type': 'text/html'
        }
      }
    }

    const body = `<html>
        <header>
        <title>Downloading data</title>
        </header>
        <body>
            <h1>Fraud Secure Page - Downloading data</h1>
            <p>Redirecting</p>
        </body>
        </html>`

    return {
      body,
      statusCode: 301,
      headers: {
        location: createTemporaryS3Link(
          fraudDataResponse.sResultsArn as string
        ),
        'Content-type': 'text/html'
      }
    }
  } catch (err) {
    console.log(err)

    return {
      statusCode: 500,
      body: '<html><body>There was an error processing your request</body></html>',
      headers: {
        'Content-type': 'text/html'
      }
    }
  }
}
