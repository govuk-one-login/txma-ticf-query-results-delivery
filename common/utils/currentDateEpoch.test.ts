import {
  currentDateEpochMilliseconds,
  currentDateEpochSeconds
} from './currentDateEpoch'

describe('currentDateEpoch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock Date.now to return a consistent value for testing
    vi.spyOn(Date, 'now').mockReturnValue(1667836126000)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('currentDateEpochSeconds', () => {
    it('should convert milliseconds to seconds by dividing by 1000', () => {
      const result = currentDateEpochSeconds()
      const milliseconds = currentDateEpochMilliseconds()
      expect(result).toBe(Math.round(milliseconds / 1000))
    })
  })
})
