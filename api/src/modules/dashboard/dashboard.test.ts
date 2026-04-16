import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../app/app.js';
import { getDashboardSummary } from './dashboard.service.js';

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

describe('dashboard service', () => {
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

  it('builds the dashboard summary from the authenticated user tasks', async () => {
    const get = vi.fn().mockResolvedValue({
      docs: [
        {
          id: 'task-1',
          data: () => ({
            title: 'Math Quiz Review',
            subject: 'Math',
            dueDate: '2026-04-18',
            priority: 'high',
            status: 'pending',
          }),
        },
        {
          id: 'task-2',
          data: () => ({
            title: 'History Essay',
            subject: 'History',
            dueDate: '2026-04-19',
            priority: 'medium',
            status: 'completed',
          }),
        },
        {
          id: 'task-3',
          data: () => ({
            title: 'Biology Flashcards',
            subject: 'Biology',
            dueDate: '2026-04-17',
            priority: 'low',
            status: 'pending',
          }),
        },
      ],
    });
    const where = vi.fn(() => ({ get }));
    const collection = vi.fn(() => ({ where }));

    getFirestore.mockReturnValue({ collection });

    await expect(getDashboardSummary('user-123')).resolves.toEqual({
      summary: {
        totalTasks: 3,
        completedTasks: 1,
        pendingTasks: 2,
        highPriorityTasks: 1,
      },
      upcomingDeadlines: [
        {
          id: 'task-3',
          title: 'Biology Flashcards',
          dueDate: '2026-04-17',
          priority: 'low',
          status: 'pending',
        },
        {
          id: 'task-1',
          title: 'Math Quiz Review',
          dueDate: '2026-04-18',
          priority: 'high',
          status: 'pending',
        },
      ],
    });
  });
});

describe('dashboard routes', () => {
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

  it('returns the authenticated user dashboard summary', async () => {
    const get = vi.fn().mockResolvedValue({
      docs: [
        {
          id: 'task-1',
          data: () => ({
            title: 'Math Quiz Review',
            subject: 'Math',
            dueDate: '2026-04-18',
            priority: 'high',
            status: 'pending',
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
      url: '/dashboard/summary',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      summary: {
        totalTasks: 1,
        completedTasks: 0,
        pendingTasks: 1,
        highPriorityTasks: 1,
      },
      upcomingDeadlines: [
        {
          id: 'task-1',
          title: 'Math Quiz Review',
          dueDate: '2026-04-18',
          priority: 'high',
          status: 'pending',
        },
      ],
    });

    await app.close();
  });

  it('returns 401 when the bearer token is missing', async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/dashboard/summary',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      message: 'Unauthorized',
    });

    await app.close();
  });
});
