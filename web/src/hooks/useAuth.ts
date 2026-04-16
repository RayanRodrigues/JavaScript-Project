import { useState } from 'react'
import { apiFetch, buildApiUrl } from '../lib/api'
import {
  clearStoredSession,
  getStoredToken,
  readStoredUser,
  storeSession,
  type AuthSession,
  type UserSession,
} from '../lib/session'

export type User = UserSession
type Session = AuthSession
type AuthResult = { success: true } | { success: false; error: string }

export function useAuth() {
  const [user, setUser] = useState<User | null>(readStoredUser)

  async function login(email: string, password: string): Promise<AuthResult> {
    try {
      const res = await apiFetch(buildApiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }, { redirectOnUnauthorized: false })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: { message?: string }; message?: string }
        return { success: false, error: body.error?.message ?? body.message ?? 'Login failed.' }
      }
      const { user: u, session } = await res.json() as { user: User; session: Session }
      storeSession(u, session)
      setUser(u)
      return { success: true }
    } catch {
      return { success: false, error: 'Unable to reach the server. Please try again.' }
    }
  }

  async function signup(email: string, password: string): Promise<AuthResult> {
    try {
      const res = await apiFetch(buildApiUrl('/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }, { redirectOnUnauthorized: false })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: { message?: string }; message?: string }
        return { success: false, error: body.error?.message ?? body.message ?? 'Registration failed.' }
      }
      const { user: u, session } = await res.json() as { user: User; session: Session }
      storeSession(u, session)
      setUser(u)
      return { success: true }
    } catch {
      return { success: false, error: 'Unable to reach the server. Please try again.' }
    }
  }

  function logout(): void {
    clearStoredSession()
    setUser(null)
  }

  return { user, login, signup, logout, getToken: getStoredToken }
}
