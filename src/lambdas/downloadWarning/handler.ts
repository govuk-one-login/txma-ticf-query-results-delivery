import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda'
import { getDownloadAvailabilityResult } from '../../sharedServices/getDownloadAvailabilityResult'

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
    if (!fraudDataResponse.hasAvailableDownload) {
      return {
        statusCode: 404,
        body: 'Not found'
      }
    }

    const body = `<html>
               <header>
               <title>Here Be Dragons</title>
               </header>
               <body>
                   <h1>Fraud Secure Page - Here Be Dragons</h1>
                   <p>Downloading data from this page is for authorised people. If this is not you, please close this page immediately.</p>
                   <p>If you are authorised to download the data please click the link below.</p>
                   <form method="POST">
                   <input type="submit" value="Download Data">
                   </form>
               </body>
               </html>`

    return {
      statusCode: 200,
      headers: {
        'Content-type': 'text/html'
      },
      body: body
    }
  } catch (err) {
    console.log(err)
    return {
      statusCode: 500,
      body: '<html><body>There was an error processing your request</body></html>'
    }
  }
}
