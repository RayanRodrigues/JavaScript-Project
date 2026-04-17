export type UserSession = { userId: string; email: string | null }
export type AuthSession = { idToken: string; refreshToken: string; expiresIn: string }

const USER_KEY = 'auth_user'
const TOKEN_KEY = 'auth_token'

export function readStoredUser(): UserSession | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
  } catch {
    return null
  }
}

export function storeSession(user: UserSession, session: AuthSession): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.setItem(TOKEN_KEY, session.idToken)
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearStoredSession(): void {
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_KEY)
}
