import { APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda'
import { getDownloadAvailabilityResult } from '../../sharedServices/getDownloadAvailabilityResult'
import {
  invalidParametersResponse,
  notFoundResponse,
  serverErrorResponse,
  htmlResponse
} from '../../sharedServices/responseHelpers'
import { createTemporaryS3Link } from './createTemporaryS3Link'
import { decrementDownloadCount } from '../../sharedServices/dynamoDb/decrementDownloadCount'
import { createDownloadPageResponse } from './createDownloadPageResponse'
import { auditTemporaryS3LinkCreated } from './auditTemporaryS3LinkCreated'
import { logger } from '../../sharedServices/logger'

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.pathParameters || !event.pathParameters.downloadHash) {
      return invalidParametersResponse()
    }
    const downloadHash = event.pathParameters.downloadHash as string

    const downloadAvailabilityResult = await getDownloadAvailabilityResult(
      downloadHash
    )

    if (!downloadAvailabilityResult.canDownload) {
      return notFoundResponse()
    }
    const temporaryS3Link = await createTemporaryS3Link({
      bucket: downloadAvailabilityResult.s3ResultsBucket as string,
      key: downloadAvailabilityResult.s3ResultsKey as string
    })
    await decrementDownloadCount(downloadHash)

    await auditTemporaryS3LinkCreated(
      downloadAvailabilityResult.zendeskId as string
    )

    return htmlResponse(200, createDownloadPageResponse(temporaryS3Link))
  } catch (err) {
    logger.error('Unknown Error', err as Error)

    return serverErrorResponse()
  }
}
