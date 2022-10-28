import { currentDateEpochMilliseconds } from '../utils/currentDateEpochMilliseconds'

export const isDateOverDaysLimit = (
  date: number,
  daysLimit: number
): boolean => {
  const diffInMs = currentDateEpochMilliseconds() - date
  const maxDayDifferenceMillis = 1000 * 3600 * 24 * daysLimit
  return diffInMs > maxDayDifferenceMillis
}
