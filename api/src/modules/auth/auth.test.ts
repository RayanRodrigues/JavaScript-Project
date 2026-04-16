import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../app/app.js';
import { loginUser, registerUser, verifyAuthToken } from './auth.service.js';

const {
  verifyIdToken,
  createUser,
  getAuth,
  getApps,
  initializeApp,
  cert,
  getFirestore,
} = vi.hoisted(() => ({
  verifyIdToken: vi.fn(),
  createUser: vi.fn(),
  getAuth: vi.fn(),
  getApps: vi.fn(),
  initializeApp: vi.fn(),
  cert: vi.fn(),
  getFirestore: vi.fn(),
}));

vi.mock('firebase-admin/app', () => ({
  getApps,
  initializeApp,
  cert,
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth,
}));

vi.mock('firebase-admin/firestore', () => ({
  getFirestore,
}));

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FIREBASE_PROJECT_ID = 'javascript-project-af405';
    process.env.FIREBASE_CLIENT_EMAIL =
      'firebase-adminsdk-fbsvc@javascript-project-af405.iam.gserviceaccount.com';
    process.env.FIREBASE_PRIVATE_KEY = 'line-1\\nline-2';

    getApps.mockReturnValue([{ name: '[DEFAULT]' }]);
    getAuth.mockReturnValue({
      verifyIdToken,
      createUser,
    });
    getFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          set: vi.fn().mockResolvedValue(undefined),
        })),
      })),
    });
    process.env.FIREBASE_WEB_API_KEY = 'web-api-key';
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('verifies the Firebase token and maps the authenticated user', async () => {
    verifyIdToken.mockResolvedValue({
      uid: 'user-123',
      email: 'student@example.com',
    });

    await expect(verifyAuthToken('valid-token')).resolves.toEqual({
      userId: 'user-123',
      email: 'student@example.com',
    });

    expect(verifyIdToken).toHaveBeenCalledWith('valid-token');
  });

  it('registers a user and returns a signed-in session', async () => {
    const set = vi.fn().mockResolvedValue(undefined);
    const doc = vi.fn(() => ({ set }));
    const collection = vi.fn(() => ({ doc }));

    createUser.mockResolvedValue({
      uid: 'user-123',
      email: 'student@example.com',
    });
    getFirestore.mockReturnValue({ collection });
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        localId: 'user-123',
        email: 'student@example.com',
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        expiresIn: '3600',
      }),
    } as Response);

    await expect(
      registerUser({
        email: 'student@example.com',
        password: 'password123',
      }),
    ).resolves.toEqual({
      user: {
        userId: 'user-123',
        email: 'student@example.com',
      },
      session: {
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        expiresIn: '3600',
      },
    });

    expect(collection).toHaveBeenCalledWith('users');
    expect(doc).toHaveBeenCalledWith('user-123');
    expect(set).toHaveBeenCalledWith({
      email: 'student@example.com',
      createdAt: expect.any(String),
    });
  });

  it('logs in a user through Firebase Identity Toolkit', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        localId: 'user-123',
        email: 'student@example.com',
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        expiresIn: '3600',
      }),
    } as Response);

    await expect(
      loginUser({
        email: 'student@example.com',
        password: 'password123',
      }),
    ).resolves.toEqual({
      user: {
        userId: 'user-123',
        email: 'student@example.com',
      },
      session: {
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        expiresIn: '3600',
      },
    });
  });
});

describe('auth routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FIREBASE_PROJECT_ID = 'javascript-project-af405';
    process.env.FIREBASE_CLIENT_EMAIL =
      'firebase-adminsdk-fbsvc@javascript-project-af405.iam.gserviceaccount.com';
    process.env.FIREBASE_PRIVATE_KEY = 'line-1\\nline-2';

    getApps.mockReturnValue([{ name: '[DEFAULT]' }]);
    getAuth.mockReturnValue({
      verifyIdToken,
      createUser,
    });
    getFirestore.mockReturnValue({
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          set: vi.fn().mockResolvedValue(undefined),
        })),
      })),
    });
    process.env.FIREBASE_WEB_API_KEY = 'web-api-key';
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('registers a user and returns the session payload', async () => {
    const set = vi.fn().mockResolvedValue(undefined);
    const doc = vi.fn(() => ({ set }));
    const collection = vi.fn(() => ({ doc }));

    createUser.mockResolvedValue({
      uid: 'user-123',
      email: 'student@example.com',
    });
    getFirestore.mockReturnValue({ collection });
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        localId: 'user-123',
        email: 'student@example.com',
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        expiresIn: '3600',
      }),
    } as Response);

    const app = await buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'student@example.com',
        password: 'password123',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      user: {
        userId: 'user-123',
        email: 'student@example.com',
      },
      session: {
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        expiresIn: '3600',
      },
    });

    await app.close();
  });

  it('logs in a user and returns the session payload', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        localId: 'user-123',
        email: 'student@example.com',
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        expiresIn: '3600',
      }),
    } as Response);

    const app = await buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'student@example.com',
        password: 'password123',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      user: {
        userId: 'user-123',
        email: 'student@example.com',
      },
      session: {
        idToken: 'id-token',
        refreshToken: 'refresh-token',
        expiresIn: '3600',
      },
    });

    await app.close();
  });

  it('returns the authenticated user for a valid bearer token', async () => {
    verifyIdToken.mockResolvedValue({
      uid: 'user-123',
      email: 'student@example.com',
    });

    const app = await buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      authenticated: true,
      user: {
        userId: 'user-123',
        email: 'student@example.com',
      },
    });

    await app.close();
  });

  it('returns 401 when the bearer token is missing', async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: 'unauthorized',
        message: 'Unauthorized',
      },
    });

    await app.close();
  });

  it('returns 401 when the bearer token is invalid', async () => {
    verifyIdToken.mockRejectedValue(new Error('invalid token'));

    const app = await buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: {
        authorization: 'Bearer invalid-token',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: 'unauthorized',
        message: 'Unauthorized',
      },
    });

    await app.close();
  });

  it('returns 409 when trying to register an existing email', async () => {
    createUser.mockRejectedValue({
      code: 'auth/email-already-exists',
    });

    const app = await buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'student@example.com',
        password: 'password123',
      },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      error: {
        code: 'auth_error',
        message: 'Email is already in use',
      },
    });

    await app.close();
  });

  it('returns 401 when login credentials are invalid', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: {
          message: 'INVALID_LOGIN_CREDENTIALS',
        },
      }),
    } as Response);

    const app = await buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'student@example.com',
        password: 'wrongpass',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: 'auth_error',
        message: 'Invalid email or password',
      },
    });

    await app.close();
  });

  it('returns 400 for unexpected auth payload fields', async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'student@example.com',
        password: 'password123',
        role: 'admin',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('invalid_request');
    expect(response.json().error.message).toBe('Invalid request data');
    expect(response.json().error.issues).toBeTruthy();
    
    await app.close();
  });

  it('returns 400 for invalid register payload', async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'not-an-email',
        password: '123',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('invalid_request');
    expect(response.json().error.message).toBe('Invalid request data');
    expect(response.json().error.issues).toBeTruthy();

    await app.close();
  });

  it('rejects malformed authorization headers', async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: {
        authorization: 'Bearer invalid extra',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: 'unauthorized',
        message: 'Unauthorized',
      },
    });

    await app.close();
  });
});
