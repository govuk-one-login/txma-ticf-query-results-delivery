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
import { initialiseLogger, logger } from '../../../common/sharedServices/logger'

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  initialiseLogger(context)
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

    return htmlResponse(200, createDownloadPageResponse(temporaryS3Link))
  } catch (err) {
    logger.error('Error while handling confirm download request', err as Error)

    return serverErrorResponse()
  }
}
