const API_ORIGIN = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
import { clearStoredSession } from './session'

type ApiFetchOptions = {
  redirectOnUnauthorized?: boolean
}

export function buildApiUrl(path: string): string {
  const trimmedOrigin = API_ORIGIN.replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const apiBase = trimmedOrigin.endsWith('/api') ? trimmedOrigin : `${trimmedOrigin}/api`

  return `${apiBase}${normalizedPath}`
}

function redirectToLogin() {
  if (typeof window === 'undefined') {
    return
  }

  if (window.location.pathname === '/login') {
    return
  }

  window.location.assign('/login')
}

export async function apiFetch(
  input: string,
  init?: RequestInit,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const response = await fetch(input, init)

  if (response.status === 401 && options.redirectOnUnauthorized !== false) {
    clearStoredSession()
    redirectToLogin()
  }

  return response
}
