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
        body: 'Invalid parameters'
      }
    }
    const fraudDataResponse = await getDownloadAvailabilityResult(
      event.pathParameters.f as string
    )

    if (!fraudDataResponse.hasAvailableDownloads) {
      // 2. return a 404 if [1] fails
      return {
        statusCode: 404,
        body: 'Not found'
      }
    }
    // 3. create the 30 second expiring link to the s3 file

    // get the object data from the DynamoDB Item

    // create the expiring link

    // 4. redirect the user to the link in [3]

    const body = `<html>
        <header>
        <title>Here Are Dragons</title>
        </header>
        <body>
            <h1>Fraud Secure Page - Here Be Dragons</h1>
            <p>Redirecting</p>
        </body>
        </html>`

    return {
      body,
      statusCode: 301,
      headers: {
        location: createTemporaryS3Link(fraudDataResponse.s3ObjectArn as string)
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
