import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../app/app.js';
import { verifyAuthToken } from './auth.service.js';

const { verifyIdToken, getAuth, getApps, initializeApp, cert } = vi.hoisted(() => ({
  verifyIdToken: vi.fn(),
  getAuth: vi.fn(),
  getApps: vi.fn(),
  initializeApp: vi.fn(),
  cert: vi.fn(),
}));

vi.mock('firebase-admin/app', () => ({
  getApps,
  initializeApp,
  cert,
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth,
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
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
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
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
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
      message: 'Unauthorized',
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
      message: 'Unauthorized',
    });

    await app.close();
  });
});
