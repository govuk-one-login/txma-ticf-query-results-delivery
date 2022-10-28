import { currentDateEpochMilliseconds } from '../utils/currentDateEpochMilliseconds'

const daysElapsed = (startDate: number, endDate: number) => {
  const diffInMs = endDate - startDate
  return Math.floor(diffInMs / (1000 * 3600 * 24))
}

const getExpiredDays = (createdDate: number): number =>
  daysElapsed(createdDate, currentDateEpochMilliseconds())

export const isDateOverDaysLimit = (
  date: number,
  daysLimit: number
): boolean => {
  return getExpiredDays(date) > daysLimit
}
