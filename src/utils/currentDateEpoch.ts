export const currentDateEpochMilliseconds = (): number => Date.now()
export const currentDateEpochSeconds = (): number =>
  Math.round(currentDateEpochMilliseconds() / 1000)
