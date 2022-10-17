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
    const temporaryS3Link = await createTemporaryS3Link({
      bucket: downloadAvailabilityResult.s3ResultsBucket as string,
      key: downloadAvailabilityResult.s3ResultsKey as string
    })

    const body = `<html>
        <header>
        <meta http-equiv="refresh" content="0; url=${temporaryS3Link}">
        <title>Downloading data</title>
        </header>
        <body>
            <h1>Fraud Secure Page - Retrieving your data</h1>
            <p>Your download should start automatically. If not, <a href="${temporaryS3Link}">click here</a></p>
        </body>
        </html>`

    await decrementDownloadCount(downloadHash)

    return {
      body,
      statusCode: 200,
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
