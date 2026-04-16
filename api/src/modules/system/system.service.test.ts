import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSystemHealth } from './system.service.js';

const { checkFirebaseConnection } = vi.hoisted(() => ({
  checkFirebaseConnection: vi.fn(),
}));

vi.mock('../../lib/firebase-admin.js', () => ({
  checkFirebaseConnection,
}));

describe('system service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns the health payload from firebase connectivity', async () => {
    checkFirebaseConnection.mockResolvedValue({
      connected: true,
      projectId: 'javascript-project-af405',
      source: 'firestore',
      document: 'system/health',
      data: {
        status: 'ok',
        firebase: 'ok',
      },
    });

    await expect(getSystemHealth()).resolves.toEqual({
      status: 'ok',
      firebase: {
        connected: true,
        projectId: 'javascript-project-af405',
        source: 'firestore',
        document: 'system/health',
        data: {
          status: 'ok',
          firebase: 'ok',
        },
      },
    });
  });
});
