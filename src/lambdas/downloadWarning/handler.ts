import {
  APIGatewayProxyResult,
  APIGatewayProxyEvent,
  Context
} from 'aws-lambda'
import { getDownloadAvailabilityResult } from '../../../common/sharedServices/getDownloadAvailabilityResult'
import {
  htmlResponse,
  invalidParametersResponse,
  notFoundResponse,
  serverErrorResponse
} from '../../../common/sharedServices/responseHelpers'
import {
  appendCorrelationId,
  initialiseLogger,
  logger,
  normaliseError
} from '../../../common/sharedServices/logger'
import { TQRD_WARNING_01 } from '../../../common/constants/errorCodes'

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  initialiseLogger(context)
  const startTime = Date.now()
  const correlationId = context.awsRequestId
  appendCorrelationId(correlationId)

  logger.info('Handler started', {
    handlerName: 'downloadWarning'
  })

  try {
    if (!event.pathParameters?.downloadHash) {
      return invalidParametersResponse()
    }
    const downloadAvailabilityResult = await getDownloadAvailabilityResult(
      event.pathParameters.downloadHash as string
    )
    logger.info('Finished getting download record', {
      downloadsRemaining: downloadAvailabilityResult.downloadsRemaining
    })

    if (!downloadAvailabilityResult.canDownload) {
      return notFoundResponse(!!downloadAvailabilityResult.zendeskId)
    }

    logger.info('Handler completed', {
      handlerName: 'downloadWarning',
      outcome: 'success',
      duration: Date.now() - startTime
    })

    return downloadConfirmResponse(
      downloadAvailabilityResult.downloadsRemaining as number
    )
  } catch (err) {
    logger.error('Handler failed', {
      errorCode: TQRD_WARNING_01,
      handlerName: 'downloadWarning',
      outcome: 'failure',
      duration: Date.now() - startTime,
      error: normaliseError(err)
    })
    return serverErrorResponse()
  }
}

const downloadConfirmResponse = (downloadsRemaining: number) => {
  const body = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <link rel="shortcut icon" sizes="16x16 32x32 48x48" href="https://design-system.service.gov.uk/assets/images/favicon.ico" type="image/x-icon" />
      <title>Data request</title>
      <style>
        :root {
          --max-width: 960px;
          --default-font: "Helvetica Neue", Arial, Helvetica, sans-serif;
          --primary-color: #0b0c0c;
          --secondary-color: #1d70b8;
        }
        .govuk-container {
          max-width: var(--max-width);
          margin: 40px auto 0;
        }
        .govuk-header {
          text-size-adjust: 100%;
          font-family: var(--default-font);
          -webkit-font-smoothing: antialiased;
          font-weight: 400;
          border-bottom: 10px solid #fff;
          color: #fff;
          background: var(--primary-color);
          font-size: 1rem;
          line-height: 1.25;
        }
        .govuk-header__container {
          text-size-adjust: 100%;
          font-family: var(--default-font);
          -webkit-font-smoothing: antialiased;
          font-weight: 400;
          color: #fff;
          font-size: 1rem;
          line-height: 1.25;
          position: relative;
          margin-bottom: -10px;
          padding-top: 10px;
          border-bottom: 10px solid #1d70b8;
          text-size-adjust: 100%;
          max-width: var(--max-width);
          margin-right: max(30px, calc(15px + env(safe-area-inset-right)));
          margin-left: max(30px, calc(15px + env(safe-area-inset-left)));
        }
        .govuk-header__link--homepage {
          text-size-adjust: 100%;
          -webkit-font-smoothing: antialiased;
          font-weight: 400;
          font-size: 1rem;
          line-height: 1.25;
          display: inline-block;
          margin-right: 10px;
          font-size: 30px;
          line-height: 1;
          text-decoration: none;
          color: #fff;
          font-weight: 700;
        }
        .govuk-heading-l {
          color: var(--primary-color);
          font-family: var(--default-font);
          -webkit-font-smoothing: antialiased;
          font-weight: 700;
          font-size: 2.25rem;
          line-height: 1.1111111111;
          display: block;
          margin-top: 0;
          margin-bottom: 30px;
        }
        .govuk-body {
          color: var(--primary-color);
          font-family: var(--default-font);
          -webkit-font-smoothing: antialiased;
          font-weight: 400;
          font-size: 1.1875rem;
          line-height: 1.3157894737;
          margin-top: 0;
          margin-bottom: 20px;
        }
        .govuk-button {
          font-family: var(--default-font);
          -webkit-font-smoothing: antialiased;
          font-weight: 400;
          font-size: 1.1875rem;
          line-height: 1;
          box-sizing: border-box;
          display: inline-block;
          position: relative;
          width: 100%;
          margin-top: 0;
          margin-right: 0;
          margin-left: 0;
          margin-bottom: 22px;
          padding: 8px 10px 7px;
          border: 2px solid rgba(0,0,0,0);
          border-radius: 0;
          color: #fff;
          background-color: #00703c;
          box-shadow: 0 2px 0 #002d18;
          text-align: center;
          vertical-align: top;
          cursor: pointer;
          -webkit-appearance: none;
        }
        @media (min-width: 40.0625em) {
          .govuk-button {
            width: auto;
          }
        }
      </style>
    </head>
    <body>
      <header class="govuk-header" role="banner" data-module="govuk-header">
        <div class="govuk-header__container">
          <a class="govuk-header__link govuk-header__link--homepage" href="/">Fraud secure page</a>
        </div>
      </header>
      <div class="govuk-container">
        <h1 class="govuk-heading-l">Download the report</h1>
        <p class="govuk-body">You have ${downloadsRemaining} download${downloadsRemaining === 1 ? '' : 's'} remaining.</p>
        <form method="post">
          <button class="govuk-button" data-module="govuk-button">Download</button>
        </form>
      </div>
    </body>
  </html>`
  return htmlResponse(200, body)
}
