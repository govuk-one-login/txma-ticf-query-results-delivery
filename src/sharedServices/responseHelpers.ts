export const notFoundResponse = () => {
  console.warn('Returning 404 response because no download record was found')
  return htmlResponse(404, '<html><body>Download not found</body></html>')
}

export const serverErrorResponse = () => {
  return htmlResponse(
    500,
    '<html><body>There was an error processing your request</body></html>'
  )
}

export const invalidParametersResponse = () => {
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

export const htmlResponse = (statusCode: number, body: string) => {
  return {
    statusCode: statusCode,
    body: body,
    headers: {
      'Content-type': 'text/html'
    }
  }
}
