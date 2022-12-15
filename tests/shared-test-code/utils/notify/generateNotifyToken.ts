import jwt from 'jsonwebtoken'
export const generateNotifyToken = (notifyApiKey: string) => {
  const secret = notifyApiKey.substring(
    notifyApiKey.length - 36,
    notifyApiKey.length
  )
  const clientId = notifyApiKey.substring(
    notifyApiKey.length - 73,
    notifyApiKey.length - 37
  )
  return createGovukNotifyToken(secret, clientId)
}

const createGovukNotifyToken = (secret: string, clientId: string): string => {
  return jwt.sign(
    {
      iss: clientId,
      iat: Math.round(Date.now() / 1000)
    },
    secret,
    {
      header: { typ: 'JWT', alg: 'HS256' }
    }
  )
}
