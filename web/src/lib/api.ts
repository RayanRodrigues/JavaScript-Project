const API_ORIGIN = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${API_ORIGIN}/api${normalizedPath}`
}
