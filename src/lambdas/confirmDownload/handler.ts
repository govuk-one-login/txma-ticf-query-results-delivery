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

    const body = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="refresh" content="0; url=${temporaryS3Link}">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
        <title>Data request</title>
        <style>
          :root {
            --max-width: 960px;
            --default-font: "Helvetica Neue", Arial, Helvetica, sans-serif;
            --primary-color: #0b0c0c;
            --secondary-color: #1d70b8;
          }
          .govuk-link {
            text-size-adjust: 100%;
            font-family: var(--default-font);
            -webkit-font-smoothing: antialiased;
            text-decoration: underline;
            text-decoration-thickness: max(1px, 0.0625rem);
            text-underline-offset: 0.1em;
            color: var(--secondary-color);
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
          .govuk-header__logo {
            text-size-adjust: 100%;
            font-family: var(--default-font);
            -webkit-font-smoothing: antialiased;
            font-weight: 400;
            color: #fff;
            font-size: 1rem;
            line-height: 1.25;
            box-sizing: border-box;
            margin-bottom: 10px;
            width: 33.33%;
            padding-right: 15px;
            vertical-align: top;
          }
          .govuk-header__link {
            display: flex;
            text-size-adjust: 100%;
            font-weight: 400;
            font-size: 1rem;
            line-height: 1.25;
            font-family: var(--default-font);
            -webkit-font-smoothing: antialiased;
            text-decoration: none;
            color: #fff;
          }
          .govuk-header__link--homepage {
            font-weight: 700;
            margin-right: 10px;
            font-size: 30px;
            line-height: 1;
            text-decoration: none;
          }
          .govuk-header__logotype {
            display: flex;
            gap: 10px;
            align-items: center;
          }
          .govuk-heading-l {
            text-size-adjust: 100%;
            color: var(--primary-color);
            font-family: var(--default-font);
            -webkit-font-smoothing: antialiased;
            font-weight: 700;
            font-size: 1.5rem;
            line-height: 1.0416666667;
            display: block;
            margin-top: 0;
            margin-bottom: 40px;
          }
          .govuk-body {
            text-size-adjust: 100%;
            color: var(--primary-color);
            font-family: var(--default-font);
            -webkit-font-smoothing: antialiased;
            font-weight: 400;
            font-size: 1rem;
            line-height: 1.25;
            margin-top: 0;
            margin-bottom: 15px;
          }
          .govuk-loader {
            margin-bottom: 20px;
          }

          @media (min-width: 1020px) {
            .govuk-width-container {
              margin-right: auto;
              margin-left: auto;
            }
          }
          @media (min-width: 40.0625em) {
            .govuk-heading-l {
              font-size: 36px;
              font-size: 2.25rem;
              line-height: 1.1111111111;
            }
            .govuk-body {
              font-size: 19px;
              font-size: 1.1875rem;
              line-height: 1.3157894737;
            }
          }
        </style>
      </head>
      <body>
        <div>
          <header class="govuk-header" role="banner" data-module="govuk-header">
            <div class="govuk-header__container govuk-width-container">
              <div class="govuk-header__logo">
                <a href="#" class="govuk-header__link govuk-header__link--homepage">
                  <span class="govuk-header__logotype">
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      class="govuk-header__logotype-crown"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 132 97"
                      height="30"
                      width="36"
                    >
                      <path
                        fill="currentColor"
                        fill-rule="evenodd"
                        d="M25 30.2c3.5 1.5 7.7-.2 9.1-3.7 1.5-3.6-.2-7.8-3.9-9.2-3.6-1.4-7.6.3-9.1 3.9-1.4 3.5.3 7.5 3.9 9zM9 39.5c3.6 1.5 7.8-.2 9.2-3.7 1.5-3.6-.2-7.8-3.9-9.1-3.6-1.5-7.6.2-9.1 3.8-1.4 3.5.3 7.5 3.8 9zM4.4 57.2c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.5-1.5-7.6.3-9.1 3.8-1.4 3.5.3 7.6 3.9 9.1zm38.3-21.4c3.5 1.5 7.7-.2 9.1-3.8 1.5-3.6-.2-7.7-3.9-9.1-3.6-1.5-7.6.3-9.1 3.8-1.3 3.6.4 7.7 3.9 9.1zm64.4-5.6c-3.6 1.5-7.8-.2-9.1-3.7-1.5-3.6.2-7.8 3.8-9.2 3.6-1.4 7.7.3 9.2 3.9 1.3 3.5-.4 7.5-3.9 9zm15.9 9.3c-3.6 1.5-7.7-.2-9.1-3.7-1.5-3.6.2-7.8 3.7-9.1 3.6-1.5 7.7.2 9.2 3.8 1.5 3.5-.3 7.5-3.8 9zm4.7 17.7c-3.6 1.5-7.8-.2-9.2-3.8-1.5-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.3 3.5-.4 7.6-3.9 9.1zM89.3 35.8c-3.6 1.5-7.8-.2-9.2-3.8-1.4-3.6.2-7.7 3.9-9.1 3.6-1.5 7.7.3 9.2 3.8 1.4 3.6-.3 7.7-3.9 9.1zM69.7 17.7l8.9 4.7V9.3l-8.9 2.8c-.2-.3-.5-.6-.9-.9L72.4 0H59.6l3.5 11.2c-.3.3-.6.5-.9.9l-8.8-2.8v13.1l8.8-4.7c.3.3.6.7.9.9l-5 15.4v.1c-.2.8-.4 1.6-.4 2.4 0 4.1 3.1 7.5 7 8.1h.2c.3 0 .7.1 1 .1.4 0 .7 0 1-.1h.2c4-.6 7.1-4.1 7.1-8.1 0-.8-.1-1.7-.4-2.4V34l-5.1-15.4c.4-.2.7-.6 1-.9zM66 92.8c16.9 0 32.8 1.1 47.1 3.2 4-16.9 8.9-26.7 14-33.5l-9.6-3.4c1 4.9 1.1 7.2 0 10.2-1.5-1.4-3-4.3-4.2-8.7L108.6 76c2.8-2 5-3.2 7.5-3.3-4.4 9.4-10 11.9-13.6 11.2-4.3-.8-6.3-4.6-5.6-7.9 1-4.7 5.7-5.9 8-.5 4.3-8.7-3-11.4-7.6-8.8 7.1-7.2 7.9-13.5 2.1-21.1-8 6.1-8.1 12.3-4.5 20.8-4.7-5.4-12.1-2.5-9.5 6.2 3.4-5.2 7.9-2 7.2 3.1-.6 4.3-6.4 7.8-13.5 7.2-10.3-.9-10.9-8-11.2-13.8 2.5-.5 7.1 1.8 11 7.3L80.2 60c-4.1 4.4-8 5.3-12.3 5.4 1.4-4.4 8-11.6 8-11.6H55.5s6.4 7.2 7.9 11.6c-4.2-.1-8-1-12.3-5.4l1.4 16.4c3.9-5.5 8.5-7.7 10.9-7.3-.3 5.8-.9 12.8-11.1 13.8-7.2.6-12.9-2.9-13.5-7.2-.7-5 3.8-8.3 7.1-3.1 2.7-8.7-4.6-11.6-9.4-6.2 3.7-8.5 3.6-14.7-4.6-20.8-5.8 7.6-5 13.9 2.2 21.1-4.7-2.6-11.9.1-7.7 8.8 2.3-5.5 7.1-4.2 8.1.5.7 3.3-1.3 7.1-5.7 7.9-3.5.7-9-1.8-13.5-11.2 2.5.1 4.7 1.3 7.5 3.3l-4.7-15.4c-1.2 4.4-2.7 7.2-4.3 8.7-1.1-3-.9-5.3 0-10.2l-9.5 3.4c5 6.9 9.9 16.7 14 33.5 14.8-2.1 30.8-3.2 47.7-3.2z"
                      ></path>
                    </svg>
                    <span class="govuk-header__logotype-text">
                      GOV.UK
                    </span>
                  </span>
                </a>
              </div>
            </div>
          </header>
          <main>
            <div class="govuk-container">
              <h1 class="govuk-heading-l">Fraud secure page</h1>
              <div class="govuk-loader">
                <svg
                  width="38"
                  height="38"
                  viewBox="0 0 38 38"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="#0b0c0c4d"
                  aria-h
                >
                  <g fill="none" fill-rule="evenodd">
                    <g transform="translate(1 1)" stroke-width="2">
                      <circle stroke-opacity=".5" cx="18" cy="18" r="18" />
                      <path d="M36 18c0-9.94-8.06-18-18-18">
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from="0 18 18"
                          to="360 18 18"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </path>
                    </g>
                  </g>
                </svg>
              </div>
              <p class="govuk-body">
                Retrieving your data and will automatically download in CSV format.
              </p>
              <p class="govuk-body">
                If the download doesn't start in 50 seconds, please
                <a href="${temporaryS3Link}" class="govuk-link">click</a> to start again.
              </p>
            </div>
          </main>
        </div>
      </body>
    </html>

    `

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
