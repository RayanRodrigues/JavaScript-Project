import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkFirebaseConnection, getFirebaseAdminApp } from './firebase-admin.js';

const { getApps, initializeApp, cert, getFirestore } = vi.hoisted(() => ({
  getApps: vi.fn(),
  initializeApp: vi.fn(),
  cert: vi.fn(),
  getFirestore: vi.fn(),
}));

vi.mock('firebase-admin/app', () => ({
  cert,
  getApps,
  initializeApp,
}));

vi.mock('firebase-admin/firestore', () => ({
  getFirestore,
}));

describe('firebase-admin helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FIREBASE_PROJECT_ID = 'javascript-project-af405';
    process.env.FIREBASE_CLIENT_EMAIL =
      'firebase-adminsdk-fbsvc@javascript-project-af405.iam.gserviceaccount.com';
    process.env.FIREBASE_PRIVATE_KEY = 'line-1\\nline-2';
  });

  it('initializes the admin app with env credentials', () => {
    const app = { name: '[DEFAULT]' };
    getApps.mockReturnValue([]);
    cert.mockReturnValue({ type: 'cert' });
    initializeApp.mockReturnValue(app);

    const result = getFirebaseAdminApp();

    expect(cert).toHaveBeenCalledWith({
      projectId: 'javascript-project-af405',
      clientEmail: 'firebase-adminsdk-fbsvc@javascript-project-af405.iam.gserviceaccount.com',
      privateKey: 'line-1\nline-2',
    });
    expect(initializeApp).toHaveBeenCalledWith({
      credential: { type: 'cert' },
    });
    expect(result).toBe(app);
  });

  it('reads the Firestore system/health document for connection status', async () => {
    const app = { name: '[DEFAULT]' };
    const get = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        status: 'ok',
        firebase: 'ok',
      }),
    });
    const doc = vi.fn(() => ({ get }));
    const collection = vi.fn(() => ({ doc }));

    getApps.mockReturnValue([app]);
    getFirestore.mockReturnValue({ collection });

    await expect(checkFirebaseConnection()).resolves.toEqual({
      connected: true,
      projectId: 'javascript-project-af405',
      source: 'firestore',
      document: 'system/health',
      data: {
        status: 'ok',
        firebase: 'ok',
      },
    });

    expect(getFirestore).toHaveBeenCalledWith(app);
    expect(collection).toHaveBeenCalledWith('system');
    expect(doc).toHaveBeenCalledWith('health');
    expect(get).toHaveBeenCalled();
  });

  it('throws when the Firestore health document does not exist', async () => {
    const app = { name: '[DEFAULT]' };
    const get = vi.fn().mockResolvedValue({
      exists: false,
      data: () => undefined,
    });
    const doc = vi.fn(() => ({ get }));
    const collection = vi.fn(() => ({ doc }));

    getApps.mockReturnValue([app]);
    getFirestore.mockReturnValue({ collection });

    await expect(checkFirebaseConnection()).rejects.toThrow(
      'Firestore health document system/health was not found',
    );
  });
});
