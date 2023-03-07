import { logger } from './logger'

export const notFoundResponse = (recordWasFound: boolean) => {
  logger.warn(
    `Returning 404 response because ${
      recordWasFound
        ? 'the download has expired or has been downloaded too many times already'
        : 'no record was found'
    }`
  )
  return emptyStatusCodeResponse(404)
}

export const serverErrorResponse = () => {
  return emptyStatusCodeResponse(500)
}

export const invalidParametersResponse = () => {
  logger.warn(
    'Returning 400 response because path parameter downloadHash not found in request'
  )
  return emptyStatusCodeResponse(400)
}

export const htmlResponse = (statusCode: number, body: string) => {
  return {
    statusCode: statusCode,
    body: body,
    headers: {
      'Content-type': 'text/html'
    }
  }
}

export const emptyStatusCodeResponse = (statusCode: number) => {
  return {
    statusCode,
    body: ''
  }
}
