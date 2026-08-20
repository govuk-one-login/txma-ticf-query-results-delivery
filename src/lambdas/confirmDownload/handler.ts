import {
  APIGatewayProxyResult,
  APIGatewayProxyEvent,
  Context
} from 'aws-lambda'
import { getDownloadAvailabilityResult } from '../../../common/sharedServices/getDownloadAvailabilityResult'
import {
  invalidParametersResponse,
  notFoundResponse,
  serverErrorResponse,
  htmlResponse
} from '../../../common/sharedServices/responseHelpers'
import { createTemporaryS3Link } from './createTemporaryS3Link'
import { decrementDownloadCount } from '../../../common/sharedServices/dynamoDb/decrementDownloadCount'
import { createDownloadPageResponse } from './createDownloadPageResponse'
import { auditTemporaryS3LinkCreated } from './auditTemporaryS3LinkCreated'
import {
  appendCorrelationId,
  initialiseLogger,
  logger,
  normaliseError
} from '../../../common/sharedServices/logger'
import { TQRD_DOWNLOAD_01 } from '../../../common/constants/errorCodes'

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  initialiseLogger(context)
  const startTime = Date.now()
  const correlationId = context.awsRequestId
  appendCorrelationId(correlationId)

  logger.info('Handler started', {
    handlerName: 'confirmDownload'
  })

  try {
    if (!event.pathParameters?.downloadHash) {
      return invalidParametersResponse()
    }
    const downloadHash = event.pathParameters.downloadHash as string

    const downloadAvailabilityResult =
      await getDownloadAvailabilityResult(downloadHash)
    logger.info('Finished getting download record')

    if (!downloadAvailabilityResult.canDownload) {
      return notFoundResponse(!!downloadAvailabilityResult.zendeskId)
    }
    const temporaryS3Link = await createTemporaryS3Link({
      bucket: downloadAvailabilityResult.s3ResultsBucket as string,
      key: downloadAvailabilityResult.s3ResultsKey as string
    })
    logger.info('Temporary S3 link generated')

    await decrementDownloadCount(downloadHash)
    logger.info('Download count decremented in database')

    await auditTemporaryS3LinkCreated(
      downloadAvailabilityResult.zendeskId as string
    )

    logger.info('Handler completed', {
      handlerName: 'confirmDownload',
      outcome: 'success',
      duration: Date.now() - startTime
    })

    return htmlResponse(200, createDownloadPageResponse(temporaryS3Link))
  } catch (err) {
    logger.error('Handler failed', {
      errorCode: TQRD_DOWNLOAD_01,
      handlerName: 'confirmDownload',
      outcome: 'failure',
      duration: Date.now() - startTime,
      error: normaliseError(err)
    })

    return serverErrorResponse()
  }
}
