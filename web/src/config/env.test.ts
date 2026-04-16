import { describe, expect, it } from 'vitest'
import { getApiOrigin, getFrontendEnv } from './env'

describe('frontend env config', () => {
  it('reads a valid frontend environment', () => {
    expect(['development', 'test', 'production']).toContain(getFrontendEnv())
  })

  it('reads the api origin', () => {
    expect(getApiOrigin()).toBe('http://localhost:3001')
  })
})
