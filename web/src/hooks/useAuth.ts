import { useState } from 'react'

export type User = { userId: string; email: string | null }
type Session = { idToken: string; refreshToken: string; expiresIn: string }
type AuthResult = { success: true } | { success: false; error: string }

const USER_KEY = 'auth_user'
const TOKEN_KEY = 'auth_token'
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

function readUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
  } catch {
    return null
  }
}

function storeSession(user: User, session: Session): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.setItem(TOKEN_KEY, session.idToken)
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(readUser)

  async function login(email: string, password: string): Promise<AuthResult> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string }
        return { success: false, error: body.message ?? 'Login failed.' }
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
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string }
        return { success: false, error: body.message ?? 'Registration failed.' }
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
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  return { user, login, signup, logout, getToken: getStoredToken }
}
