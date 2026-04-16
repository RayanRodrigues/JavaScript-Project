import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { useAuth } from './useAuth'

beforeEach(() => {
  localStorage.clear()
})

describe('useAuth', () => {
  it('returns null user when no session is stored', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.user).toBeNull()
  })

  it('signup creates an account and sets the user', () => {
    const { result } = renderHook(() => useAuth())
    act(() => {
      result.current.signup('Alice', 'alice@example.com', 'secret1')
    })
    expect(result.current.user).toEqual({ name: 'Alice', email: 'alice@example.com' })
  })

  it('signup persists the user in localStorage', () => {
    const { result } = renderHook(() => useAuth())
    act(() => {
      result.current.signup('Alice', 'alice@example.com', 'secret1')
    })
    const stored = JSON.parse(localStorage.getItem('auth_user')!)
    expect(stored).toEqual({ name: 'Alice', email: 'alice@example.com' })
  })

  it('signup returns an error when email is already registered', () => {
    const { result } = renderHook(() => useAuth())
    act(() => {
      result.current.signup('Alice', 'alice@example.com', 'secret1')
    })
    let outcome: ReturnType<typeof result.current.signup>
    act(() => {
      outcome = result.current.signup('Alice 2', 'alice@example.com', 'secret2')
    })
    expect(outcome!).toEqual({ success: false, error: 'An account with this email already exists.' })
  })

  it('login succeeds with correct credentials', () => {
    const { result } = renderHook(() => useAuth())
    act(() => {
      result.current.signup('Bob', 'bob@example.com', 'pass123')
    })
    act(() => {
      result.current.logout()
    })
    act(() => {
      result.current.login('bob@example.com', 'pass123')
    })
    expect(result.current.user).toEqual({ name: 'Bob', email: 'bob@example.com' })
  })

  it('login returns an error for wrong password', () => {
    const { result } = renderHook(() => useAuth())
    act(() => {
      result.current.signup('Bob', 'bob@example.com', 'pass123')
    })
    act(() => {
      result.current.logout()
    })
    let outcome: ReturnType<typeof result.current.login>
    act(() => {
      outcome = result.current.login('bob@example.com', 'wrongpass')
    })
    expect(outcome!).toEqual({ success: false, error: 'Invalid email or password.' })
  })

  it('logout clears the user', () => {
    const { result } = renderHook(() => useAuth())
    act(() => {
      result.current.signup('Carol', 'carol@example.com', 'abc123')
    })
    act(() => {
      result.current.logout()
    })
    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('auth_user')).toBeNull()
  })

  it('restores session from localStorage on mount', () => {
    localStorage.setItem('auth_user', JSON.stringify({ name: 'Dan', email: 'dan@example.com' }))
    const { result } = renderHook(() => useAuth())
    expect(result.current.user).toEqual({ name: 'Dan', email: 'dan@example.com' })
  })
})
