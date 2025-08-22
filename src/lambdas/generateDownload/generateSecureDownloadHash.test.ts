import { generateSecureDownloadHash } from './generateSecureDownloadHash'
import crypto from 'crypto'

// Mock crypto.randomUUID
jest.mock('crypto', () => ({
  randomUUID: jest.fn()
}))

const mockCrypto = crypto as jest.Mocked<typeof crypto>

describe('generateSecureDownloadHash', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return different values on subsequent calls', () => {
    const firstUUID = '123e4567-e89b-12d3-a456-426614174000'
    const secondUUID = '987fcdeb-51a2-43d7-b123-987654321098'

    mockCrypto.randomUUID
      .mockReturnValueOnce(firstUUID)
      .mockReturnValueOnce(secondUUID)

    const firstResult = generateSecureDownloadHash()
    const secondResult = generateSecureDownloadHash()

    expect(firstResult).toBe(firstUUID)
    expect(secondResult).toBe(secondUUID)
    expect(firstResult).not.toBe(secondResult)
    expect(crypto.randomUUID).toHaveBeenCalledTimes(2)
  })
})
