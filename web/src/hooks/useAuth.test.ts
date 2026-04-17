import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuth } from './useAuth'

const fakeUser = { userId: 'u1', email: 'alice@example.com' }
const fakeSession = { idToken: 'tok123', refreshToken: 'ref456', expiresIn: '3600' }

function stubFetchOk(body: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(body),
  }))
}

function stubFetchFail(body: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: false,
    json: () => Promise.resolve(body),
  }))
}

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('useAuth', () => {
  it('returns null user when no session is stored', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.user).toBeNull()
  })

  it('restores user from localStorage on mount', () => {
    localStorage.setItem('auth_user', JSON.stringify(fakeUser))
    const { result } = renderHook(() => useAuth())
    expect(result.current.user).toEqual(fakeUser)
  })

  it('login sets user and stores token on success', async () => {
    stubFetchOk({ user: fakeUser, session: fakeSession })
    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.login('alice@example.com', 'pass123')
    })
    expect(result.current.user).toEqual(fakeUser)
    expect(localStorage.getItem('auth_token')).toBe('tok123')
  })

  it('login returns the server error message on failure', async () => {
    stubFetchFail({ message: 'Invalid email or password' })
    const { result } = renderHook(() => useAuth())
    let outcome!: Awaited<ReturnType<typeof result.current.login>>
    await act(async () => {
      outcome = await result.current.login('alice@example.com', 'wrong')
    })
    expect(outcome).toEqual({ success: false, error: 'Invalid email or password' })
    expect(result.current.user).toBeNull()
  })

  it('login returns a network error when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))
    const { result } = renderHook(() => useAuth())
    let outcome!: Awaited<ReturnType<typeof result.current.login>>
    await act(async () => {
      outcome = await result.current.login('alice@example.com', 'pass123')
    })
    expect(outcome).toEqual({ success: false, error: 'Unable to reach the server. Please try again.' })
  })

  it('signup sets user and stores token on success', async () => {
    stubFetchOk({ user: fakeUser, session: fakeSession })
    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.signup('alice@example.com', 'pass123')
    })
    expect(result.current.user).toEqual(fakeUser)
    expect(localStorage.getItem('auth_token')).toBe('tok123')
  })

  it('signup returns error on duplicate email', async () => {
    stubFetchFail({ message: 'Email is already in use' })
    const { result } = renderHook(() => useAuth())
    let outcome!: Awaited<ReturnType<typeof result.current.signup>>
    await act(async () => {
      outcome = await result.current.signup('alice@example.com', 'pass123')
    })
    expect(outcome).toEqual({ success: false, error: 'Email is already in use' })
  })

  it('logout revokes the server session and clears local auth state', async () => {
    stubFetchOk({ user: fakeUser, session: fakeSession })
    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.login('alice@example.com', 'pass123')
    })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    }))

    await act(async () => {
      await result.current.logout()
    })

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/auth/logout',
      expect.objectContaining({
        method: 'POST',
        headers: expect.any(Headers),
      }),
    )

    const [, init] = vi.mocked(fetch).mock.calls[0]
    expect((init?.headers as Headers).get('Authorization')).toBe('Bearer tok123')
    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('auth_user')).toBeNull()
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('logout still clears local auth state when the revoke request fails', async () => {
    stubFetchOk({ user: fakeUser, session: fakeSession })
    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.login('alice@example.com', 'pass123')
    })

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('auth_user')).toBeNull()
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it('getToken returns the stored idToken', async () => {
    stubFetchOk({ user: fakeUser, session: fakeSession })
    const { result } = renderHook(() => useAuth())
    await act(async () => {
      await result.current.login('alice@example.com', 'pass123')
    })
    expect(result.current.getToken()).toBe('tok123')
  })
})
