import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda'
import { getDownloadAvailabilityResult } from '../../sharedServices/getDownloadAvailabilityResult'
import {
  invalidParametersResponse,
  notFoundResponse,
  serverErrorResponse
} from '../../sharedServices/responseHelpers'
import { createTemporaryS3Link } from './createTemporaryS3Link'
import { decrementDownloadCount } from '../../sharedServices/dynamoDb/decrementDownloadCount'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('received request', JSON.stringify(event))
  try {
    if (!event.pathParameters || !event.pathParameters.downloadHash) {
      return invalidParametersResponse()
    }
    const downloadHash = event.pathParameters.downloadHash as string
    const downloadAvailabilityResult = await getDownloadAvailabilityResult(
      downloadHash
    )

    if (!downloadAvailabilityResult.hasAvailableDownload) {
      return notFoundResponse()
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

    const temporaryS3Link = await createTemporaryS3Link(
      downloadAvailabilityResult.sResultsArn as string
    )

    await decrementDownloadCount(downloadHash)

    return {
      body,
      statusCode: 301,
      headers: {
        location: temporaryS3Link,
        'Content-type': 'text/html'
      }
    }
  } catch (err) {
    console.log(err)

    return serverErrorResponse()
  }
}
