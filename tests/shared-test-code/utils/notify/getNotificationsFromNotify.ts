import axios from 'axios'
import { NotificationsResponse } from '../../types/notify/notificationsResponse'
import { getIntegrationTestEnvironmentVariable } from '../getIntegrationTestEnvironmentVariable'
import { generateNotifyToken } from './generateNotifyToken'

export const getNotificationsFromNotify = async (
  reference: string
): Promise<NotificationsResponse> => {
  const response = await axios({
    url: `https://api.notifications.service.gov.uk/v2/notifications?reference=${reference}`,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${generateNotifyToken(
        getIntegrationTestEnvironmentVariable('NOTIFY_API_KEY')
      )}`
    }
  })
  console.log(response)
  return response.data
}
