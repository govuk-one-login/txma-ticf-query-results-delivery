import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda'
import { getDownloadAvailabilityResult } from '../../sharedServices/getDownloadAvailabilityResult'
import { createTemporaryS3Link } from './createTemporaryS3Link'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.pathParameters || !event.pathParameters.downloadHash) {
      return {
        statusCode: 400,
        body: '<html><body>Invalid parameters</body></html>'
      }
    }
    const fraudDataResponse = await getDownloadAvailabilityResult(
      event.pathParameters.downloadHash as string
    )

    if (!fraudDataResponse.hasAvailableDownload) {
      return {
        statusCode: 404,
        body: 'Not found'
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
        location: createTemporaryS3Link(fraudDataResponse.sResultsArn as string)
      }
    }
  } catch (err) {
    console.log(err)

    return {
      statusCode: 500,
      body: '<html><body>There was an error processing your request</body></html>'
    }
  }
}
