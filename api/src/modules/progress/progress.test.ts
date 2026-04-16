import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../app/app.js';
import { getProgressSummary } from './progress.service.js';

const {
  verifyIdToken,
  getAuth,
  getApps,
  initializeApp,
  cert,
  getFirestore,
} = vi.hoisted(() => ({
  verifyIdToken: vi.fn(),
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

describe('progress service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FIREBASE_PROJECT_ID = 'javascript-project-af405';
    process.env.FIREBASE_CLIENT_EMAIL =
      'firebase-adminsdk-fbsvc@javascript-project-af405.iam.gserviceaccount.com';
    process.env.FIREBASE_PRIVATE_KEY = 'line-1\\nline-2';

    getApps.mockReturnValue([{ name: '[DEFAULT]' }]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('builds progress summary and subject breakdown from user tasks', async () => {
    const get = vi.fn().mockResolvedValue({
      docs: [
        {
          id: 'task-1',
          data: () => ({
            title: 'Math Quiz Review',
            subject: 'Math',
            dueDate: '2026-04-18',
            priority: 'high',
            status: 'completed',
          }),
        },
        {
          id: 'task-2',
          data: () => ({
            title: 'History Essay',
            subject: 'History',
            dueDate: '2026-04-19',
            priority: 'medium',
            status: 'pending',
          }),
        },
        {
          id: 'task-3',
          data: () => ({
            title: 'Biology Flashcards',
            subject: 'Math',
            dueDate: '2026-04-20',
            priority: 'low',
            status: 'completed',
          }),
        },
      ],
    });
    const where = vi.fn(() => ({ get }));
    const collection = vi.fn(() => ({ where }));

    getFirestore.mockReturnValue({ collection });

    await expect(getProgressSummary('user-123')).resolves.toEqual({
      summary: {
        totalTasks: 3,
        completedTasks: 2,
        completionRate: 66.67,
      },
      subjects: [
        {
          subject: 'Math',
          totalTasks: 2,
          completedTasks: 2,
          completionRate: 100,
        },
        {
          subject: 'History',
          totalTasks: 1,
          completedTasks: 0,
          completionRate: 0,
        },
      ],
    });
  });
});

describe('progress routes', () => {
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

  it('returns the authenticated user progress summary', async () => {
    const get = vi.fn().mockResolvedValue({
      docs: [
        {
          id: 'task-1',
          data: () => ({
            title: 'Math Quiz Review',
            subject: 'Math',
            dueDate: '2026-04-18',
            priority: 'high',
            status: 'completed',
          }),
        },
      ],
    });
    const where = vi.fn(() => ({ get }));
    const collection = vi.fn(() => ({ where }));

    verifyIdToken.mockResolvedValue({
      uid: 'user-123',
      email: 'student@example.com',
    });
    getFirestore.mockReturnValue({ collection });

    const app = await buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/api/progress/summary',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      summary: {
        totalTasks: 1,
        completedTasks: 1,
        completionRate: 100,
      },
      subjects: [
        {
          subject: 'Math',
          totalTasks: 1,
          completedTasks: 1,
          completionRate: 100,
        },
      ],
    });

    await app.close();
  });

  it('returns 401 when the bearer token is missing', async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/api/progress/summary',
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
