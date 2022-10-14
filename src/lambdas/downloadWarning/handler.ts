import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda'
import { getDownloadAvailabilityResult } from '../../sharedServices/getDownloadAvailabilityResult'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('received request', event)
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

    return {
      statusCode: 200,
      headers: {
        'Content-type': 'text/html'
      },
      body: body
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: '<html><body>There was an error processing your request</body></html>',
      headers: {
        'Content-type': 'text/html'
      }
    }
  }
}
