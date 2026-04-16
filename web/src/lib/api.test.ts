import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch, buildApiUrl } from './api'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('api helpers', () => {
  it('builds /api urls without duplicating the prefix', () => {
    expect(buildApiUrl('/tasks')).toBe('http://localhost:3001/api/tasks')
  })

  it('clears the session and redirects on unauthorized responses', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ userId: 'u-1', email: 'student@example.com' }))
    localStorage.setItem('auth_token', 'stale-token')

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })))
    const assign = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { pathname: '/tasks', assign },
    })

    await apiFetch('http://localhost:3001/api/tasks')

    expect(localStorage.getItem('auth_user')).toBeNull()
    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(assign).toHaveBeenCalledWith('/login')
  })

  it('does not redirect when unauthorized redirect is disabled', async () => {
    localStorage.setItem('auth_token', 'stale-token')

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })))
    const assign = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { pathname: '/login', assign },
    })

    await apiFetch('http://localhost:3001/api/auth/login', undefined, {
      redirectOnUnauthorized: false,
    })

    expect(localStorage.getItem('auth_token')).toBe('stale-token')
    expect(assign).not.toHaveBeenCalled()
  })
})
