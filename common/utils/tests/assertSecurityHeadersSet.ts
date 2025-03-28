import { APIGatewayProxyResult } from 'aws-lambda'

export const assertSecurityHeadersSet = (result: APIGatewayProxyResult) => {
  expect(result.headers?.['Strict-Transport-Security']).toEqual(
    'max-age=31536000; includeSubDomains; preload'
  )

  expect(result.headers?.['X-Frame-Options']).toEqual('DENY')
}
