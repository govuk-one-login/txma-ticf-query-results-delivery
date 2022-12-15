import { parse } from 'node-html-parser'

export const retrieveS3LinkFromHtml = (htmlBody: string): string => {
  const htmlRoot = parse(htmlBody)
  const metaTag = htmlRoot.querySelector('meta[http-equiv="refresh"]')
  const contentAttribute = metaTag?.attributes['content'] as string
  expect(contentAttribute).toBeDefined()

  const urlMatch = contentAttribute.match(/url=(.*)/)
  const url = urlMatch ? urlMatch[1] : undefined
  expect(url).toBeDefined()
  return url as string
}
