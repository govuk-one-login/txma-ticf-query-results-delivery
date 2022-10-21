export const notFoundResponse = () => {
  console.warn('Returning 404 response because no download record was found')
  return emptyStatusCodeResponse(404)
}

export const serverErrorResponse = () => {
  return emptyStatusCodeResponse(500)
}

export const invalidParametersResponse = () => {
  console.warn(
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
