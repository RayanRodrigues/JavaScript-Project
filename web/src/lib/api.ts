import { clearStoredSession } from './session'
import { getStoredToken } from './session'
import { getApiOrigin } from '../config/env'

type ApiFetchOptions = {
  redirectOnUnauthorized?: boolean
}

export function buildApiUrl(path: string): string {
  const trimmedOrigin = getApiOrigin()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const apiBase = trimmedOrigin.endsWith('/api') ? trimmedOrigin : `${trimmedOrigin}/api`

  return `${apiBase}${normalizedPath}`
}

export function buildAuthHeaders(headers: HeadersInit = {}): Headers {
  const normalizedHeaders = new Headers(headers)
  const token = getStoredToken()

  if (token) {
    normalizedHeaders.set('Authorization', `Bearer ${token}`)
  }

  return normalizedHeaders
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
