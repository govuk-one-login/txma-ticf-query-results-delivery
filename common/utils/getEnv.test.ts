import { getEnv } from './getEnv'

describe('getEnv', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should return environment variable value when it exists', () => {
    process.env.AWS_REGION = 'us-east-1'

    expect(getEnv('AWS_REGION')).toBe('us-east-1')
  })

  it('should throw an error when environment variable is missing', () => {
    delete process.env.AWS_REGION

    expect(() => getEnv('AWS_REGION')).toThrow(
      'Missing environment variable: AWS_REGION'
    )
  })

  it('should throw an error when environment variable is undefined', () => {
    process.env.AWS_REGION = undefined

    expect(() => getEnv('AWS_REGION')).toThrow(
      'Missing environment variable: AWS_REGION'
    )
  })
})
