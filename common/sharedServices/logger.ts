import {
  logger,
  initialiseLogger as baseInitialiseLogger
} from '@govuk-one-login/dpt-logging'
import { Context } from 'aws-lambda'

/**
 * Initialise the shared logger with Lambda context.
 * Extends the base initialisation by also clearing repo-specific
 * contextual keys (zendeskId, correlationId) between invocations.
 */
export const initialiseLogger = (context: Context) => {
  baseInitialiseLogger(context)
  logger.removeKeys(['zendeskId', 'correlationId'])
}

export const appendZendeskIdToLogger = (zendeskId: string) => {
  logger.appendKeys({ zendeskId })
}

export const appendCorrelationId = (correlationId: string) => {
  logger.appendKeys({ correlationId })
}

/**
 * Normalises an error object into a consistent structured format
 * for logging. Always extracts message, name, and stack.
 */
export const normaliseError = (
  err: unknown
): { message: string; name: string; stack?: string } => {
  if (err instanceof Error) {
    return {
      message: err.message,
      name: err.name,
      stack: err.stack
    }
  }
  return {
    message: String(err),
    name: 'UnknownError'
  }
}

export { logger }
