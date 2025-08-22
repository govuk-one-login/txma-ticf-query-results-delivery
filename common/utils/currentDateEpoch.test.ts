import {
  currentDateEpochMilliseconds,
  currentDateEpochSeconds
} from './currentDateEpoch'

describe('currentDateEpoch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock Date.now to return a consistent value for testing
    jest.spyOn(Date, 'now').mockReturnValue(1667836126000)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('currentDateEpochSeconds', () => {
    it('should convert milliseconds to seconds by dividing by 1000', () => {
      const result = currentDateEpochSeconds()
      const milliseconds = currentDateEpochMilliseconds()
      expect(result).toBe(Math.round(milliseconds / 1000))
    })
  })
})
