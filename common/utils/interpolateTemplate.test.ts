import { interpolateTemplate } from './interpolateTemplate'

describe('interpolateTemplate', () => {
  it('returns message without placeholders', () => {
    const messages = [{ name: 'simple', message: 'Hello, world!' }]
    expect(interpolateTemplate('simple', messages)).toBe('Hello, world!')
  })

  it('replaces single placeholder', () => {
    const messages = [{ name: 'withPlaceholder', message: 'Hello, {key}!' }]
    expect(
      interpolateTemplate('withPlaceholder', messages, { key: 'value' })
    ).toBe('Hello, value!')
  })

  it('uses message replacements', () => {
    const messages = [
      {
        name: 'withReplacements',
        message: 'Welcome to {place}',
        replacements: { place: 'valueA' }
      }
    ]
    expect(interpolateTemplate('withReplacements', messages)).toBe(
      'Welcome to valueA'
    )
  })

  it('prioritizes additions over message replacements', () => {
    const messages = [
      {
        name: 'withReplacements',
        message: 'Welcome to {place}',
        replacements: { place: 'valueA' }
      }
    ]
    expect(
      interpolateTemplate('withReplacements', messages, { place: 'valueB' })
    ).toBe('Welcome to valueB')
  })

  it('replaces multiple placeholders', () => {
    const messages = [
      { name: 'multiple', message: '{key1} {key2}, you have {key3} messages.' }
    ]
    expect(
      interpolateTemplate('multiple', messages, {
        key1: 'valueA',
        key2: 'valueB',
        key3: 'valueC'
      })
    ).toBe('valueA valueB, you have valueC messages.')
  })

  it('leaves unreplaced placeholders unchanged', () => {
    const messages = [{ name: 'withPlaceholder', message: 'Hello, {key}!' }]
    expect(
      interpolateTemplate('withPlaceholder', messages, { wrong: 'value' })
    ).toBe('Hello, {key}!')
  })

  it('throws when message not found', () => {
    const messages = [{ name: 'simple', message: 'Hello, world!' }]
    expect(() => interpolateTemplate('missing', messages)).toThrow(
      "No message object returned for 'missing'"
    )
  })

  it('throws when messages is null / undefined', () => {
    expect(() => interpolateTemplate('simple', null!)).toThrow(
      'Messages data is not included'
    )
  })
})
