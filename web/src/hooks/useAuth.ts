import { useState } from 'react'

export type User = { name: string; email: string }

type Account = { name: string; email: string; password: string }
type AuthResult = { success: true } | { success: false; error: string }

const USER_KEY = 'auth_user'
const ACCOUNTS_KEY = 'auth_accounts'

function readAccounts(): Account[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function writeAccounts(accounts: Account[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

function readUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
  } catch {
    return null
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(readUser)

  function login(email: string, password: string): AuthResult {
    const match = readAccounts().find(a => a.email === email && a.password === password)
    if (!match) return { success: false, error: 'Invalid email or password.' }
    const u: User = { name: match.name, email: match.email }
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setUser(u)
    return { success: true }
  }

  function signup(name: string, email: string, password: string): AuthResult {
    const accounts = readAccounts()
    if (accounts.some(a => a.email === email)) {
      return { success: false, error: 'An account with this email already exists.' }
    }
    writeAccounts([...accounts, { name, email, password }])
    const u: User = { name, email }
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setUser(u)
    return { success: true }
  }

  function logout(): void {
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  return { user, login, signup, logout }
}
