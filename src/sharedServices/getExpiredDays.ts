import { currentDateEpochMilliseconds } from '../utils/currentDateEpochMilliseconds'

const daysElapsed = (startDate: number, endDate: number) => {
  const diffInMs = endDate - startDate
  return Math.floor(diffInMs / (1000 * 3600 * 24))
}

export const getExpiredDays = (createdDate: number) =>
  daysElapsed(createdDate, currentDateEpochMilliseconds())
