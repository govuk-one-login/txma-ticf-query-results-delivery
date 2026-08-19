import { APIGatewayProxyResult } from 'aws-lambda'
import { logger } from './logger'
import {
  TQRD_RESPONSE_01,
  TQRD_RESPONSE_02,
  TQRD_RESPONSE_03
} from '../constants/errorCodes'

export const notFoundResponse = (recordWasFound: boolean) => {
  if (recordWasFound) {
    logger.warn('Returning 404 response', {
      errorCode: TQRD_RESPONSE_02,
      reason: 'download expired or downloaded too many times'
    })
  } else {
    logger.warn('Returning 404 response', {
      errorCode: TQRD_RESPONSE_01,
      reason: 'no record was found'
    })
  }
  return emptyStatusCodeResponse(404)
}

export const serverErrorResponse = () => {
  return emptyStatusCodeResponse(500)
}

export const invalidParametersResponse = () => {
  logger.warn('Returning 400 response', {
    errorCode: TQRD_RESPONSE_03,
    reason: 'path parameter downloadHash not found in request'
  })
  return emptyStatusCodeResponse(400)
}

export const htmlResponse = (statusCode: number, body: string) => {
  return appendSecurityHeadersToResponse({
    statusCode: statusCode,
    body: body,
    headers: {
      'Content-type': 'text/html'
    }
  })
}

export const emptyStatusCodeResponse = (statusCode: number) => {
  return appendSecurityHeadersToResponse({
    statusCode,
    body: ''
  })
}

const appendSecurityHeadersToResponse = (
  response: APIGatewayProxyResult
): APIGatewayProxyResult => {
  if (!response.headers) {
    response.headers = {}
  }
  response.headers['Strict-Transport-Security'] =
    'max-age=31536000; includeSubDomains; preload'
  response.headers['X-Frame-Options'] = 'DENY'
  return response
}
