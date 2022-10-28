import { isDateOverDaysLimit } from './isDateOverDaysLimit'
import { currentDateEpochMilliseconds } from '../utils/currentDateEpochMilliseconds'
import { when } from 'jest-when'
jest.mock('../utils/currentDateEpochMilliseconds', () => ({
  currentDateEpochMilliseconds: jest.fn()
}))

describe('isDateOverDaysLimit', () => {
  const MOCK_CURRENT_TIME = 1666956229830
  const DAYS_LIMIT = 7
  beforeEach(() => {
    when(currentDateEpochMilliseconds).mockReturnValue(MOCK_CURRENT_TIME)
  })
  it('should return true if date is 1 millisecond over the limit', () => {
    const sevenDaysAgoPlusOneMillisecond =
      MOCK_CURRENT_TIME - 1000 * 3600 * 24 * 7 - 1
    expect(
      isDateOverDaysLimit(sevenDaysAgoPlusOneMillisecond, DAYS_LIMIT)
    ).toEqual(true)
  })

  it('should return true if date is 1 day over the limit', () => {
    const sevenDaysAgoPlusOneDay = MOCK_CURRENT_TIME - 1000 * 3600 * 24 * 8
    expect(isDateOverDaysLimit(sevenDaysAgoPlusOneDay, DAYS_LIMIT)).toEqual(
      true
    )
  })

  it('should return false if date is on the limit', () => {
    const sevenDaysAgoExactly = MOCK_CURRENT_TIME - 1000 * 3600 * 24 * 7
    expect(isDateOverDaysLimit(sevenDaysAgoExactly, DAYS_LIMIT)).toEqual(false)
  })

  it('should return false if date is within the limit by a millisecond', () => {
    const sevenDaysAgoMinusOneMillisecond =
      MOCK_CURRENT_TIME - 1000 * 3600 * 24 * 7 + 1
    expect(
      isDateOverDaysLimit(sevenDaysAgoMinusOneMillisecond, DAYS_LIMIT)
    ).toEqual(false)
  })

  it('should return false if date is within the limit by a day', () => {
    const sixDaysAgo = MOCK_CURRENT_TIME - 1000 * 3600 * 24 * 6
    expect(isDateOverDaysLimit(sixDaysAgo, DAYS_LIMIT)).toEqual(false)
  })
})
