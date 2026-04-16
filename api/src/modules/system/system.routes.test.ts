import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../app/app.js';

const { getSystemHealth } = vi.hoisted(() => ({
  getSystemHealth: vi.fn(),
}));

vi.mock('./system.service.js', () => ({
  getSystemHealth,
}));

describe('system routes', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns firebase status when the Firestore health check succeeds', async () => {
    getSystemHealth.mockResolvedValue({
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

    const app = await buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
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

    await app.close();
  });

  it('returns 503 when the Firestore health check fails', async () => {
    getSystemHealth.mockRejectedValue(new Error('firestore unavailable'));

    const app = await buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toEqual({
      status: 'error',
      firebase: {
        connected: false,
      },
    });

    await app.close();
  });
});
