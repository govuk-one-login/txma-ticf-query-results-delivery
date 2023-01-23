import { logger } from '../sharedServices/logger'

export const tryParseJSON = (jsonString: string) => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    logger.error('Error parsing JSON: ', error as Error)
    return {}
  }
}
