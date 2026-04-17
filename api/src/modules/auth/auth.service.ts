import { getFirebaseAdminAuth, getFirebaseAdminFirestore } from '../../lib/firebase-admin.js';
import type { AuthCredentialsBody, AuthenticatedUser } from './auth.schema.js';

export class AuthError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message);
  }
}

function requireWebApiKey() {
  const apiKey = process.env.FIREBASE_WEB_API_KEY;

  if (!apiKey) {
    throw new Error('Missing required environment variable: FIREBASE_WEB_API_KEY');
  }

  return apiKey;
}

async function signInWithPassword(input: AuthCredentialsBody) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${requireWebApiKey()}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        returnSecureToken: true,
      }),
    },
  );

  if (!response.ok) {
    throw new AuthError('Invalid email or password', 401);
  }

  const data = (await response.json()) as {
    localId: string;
    email: string;
    idToken: string;
    refreshToken: string;
    expiresIn: string;
  };

  return {
    user: {
      userId: data.localId,
      email: data.email,
    },
    session: {
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
    },
  };
}

async function createUserProfile(user: AuthenticatedUser) {
  await getFirebaseAdminFirestore()
    .collection('users')
    .doc(user.userId)
    .set({
      email: user.email,
      createdAt: new Date().toISOString(),
    });
}

export async function verifyAuthToken(token: string): Promise<AuthenticatedUser> {
  const decodedToken = await getFirebaseAdminAuth().verifyIdToken(token, true);

  return {
    userId: decodedToken.uid,
    email: decodedToken.email ?? null,
  };
}

export async function logoutUser(userId: string) {
  await getFirebaseAdminAuth().revokeRefreshTokens(userId);

  return { success: true as const };
}

export async function registerUser(input: AuthCredentialsBody) {
  try {
    const createdUser = await getFirebaseAdminAuth().createUser({
      email: input.email,
      password: input.password,
    });
    const user = {
      userId: createdUser.uid,
      email: createdUser.email ?? input.email,
    };

    await createUserProfile(user);
    const session = await signInWithPassword(input);

    return {
      user,
      session: session.session,
    };
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'auth/email-already-exists'
    ) {
      throw new AuthError('Invalid email or password', 401);
    }

    throw error;
  }
}

export async function loginUser(input: AuthCredentialsBody) {
  return signInWithPassword(input);
}
