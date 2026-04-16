const VALID_APP_ENVS = ['development', 'test', 'production'] as const

export type FrontendEnv = (typeof VALID_APP_ENVS)[number]

function requireEnv(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} must be set`)
  }

  return value.trim()
}

export function getFrontendEnv(): FrontendEnv {
  const env = requireEnv('VITE_ENV', import.meta.env.VITE_ENV)

  if (!VALID_APP_ENVS.includes(env as FrontendEnv)) {
    throw new Error('VITE_ENV must be development, test, or production')
  }

  return env as FrontendEnv
}

export function getApiOrigin(): string {
  getFrontendEnv()

  return requireEnv('VITE_API_URL', import.meta.env.VITE_API_URL).replace(/\/+$/, '')
}

export function getFirebaseConfig() {
  getFrontendEnv()

  return {
    apiKey: requireEnv('VITE_FIREBASE_API_KEY', import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: requireEnv('VITE_FIREBASE_AUTH_DOMAIN', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: requireEnv('VITE_FIREBASE_PROJECT_ID', import.meta.env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: requireEnv('VITE_FIREBASE_STORAGE_BUCKET', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: requireEnv(
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    ),
    appId: requireEnv('VITE_FIREBASE_APP_ID', import.meta.env.VITE_FIREBASE_APP_ID),
  }
}
