import { generateSecureDownloadHash } from './generateSecureDownloadHash'

const mockRandomUUID = vi.hoisted(() => vi.fn<() => string>())

// Mock crypto.randomUUID
vi.mock('crypto', () => ({
  default: { randomUUID: mockRandomUUID },
  randomUUID: mockRandomUUID
}))

describe('generateSecureDownloadHash', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return different values on subsequent calls', () => {
    const firstUUID = '123e4567-e89b-12d3-a456-426614174000'
    const secondUUID = '987fcdeb-51a2-43d7-b123-987654321098'

    mockRandomUUID
      .mockReturnValueOnce(firstUUID)
      .mockReturnValueOnce(secondUUID)

    const firstResult = generateSecureDownloadHash()
    const secondResult = generateSecureDownloadHash()

    expect(firstResult).toBe(firstUUID)
    expect(secondResult).toBe(secondUUID)
    expect(firstResult).not.toBe(secondResult)
    expect(mockRandomUUID).toHaveBeenCalledTimes(2)
  })
})
