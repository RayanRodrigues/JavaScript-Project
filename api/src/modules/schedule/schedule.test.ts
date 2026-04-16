import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../app/app.js';
import { getScheduleSummary } from './schedule.service.js';

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

describe('schedule service', () => {
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

  it('builds the schedule summary from task due dates', async () => {
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
            dueDate: '2026-04-15',
            priority: 'medium',
            status: 'pending',
          }),
        },
        {
          id: 'task-3',
          data: () => ({
            title: 'Biology Flashcards',
            subject: 'Biology',
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

    await expect(getScheduleSummary('user-123', '2026-04-16')).resolves.toEqual({
      summary: {
        scheduledTasks: 3,
        overdueTasks: 1,
        completedTasks: 1,
      },
      upcoming: [
        {
          id: 'task-1',
          title: 'Math Quiz Review',
          subject: 'Math',
          dueDate: '2026-04-18',
          priority: 'high',
          status: 'pending',
        },
      ],
      overdue: [
        {
          id: 'task-2',
          title: 'History Essay',
          subject: 'History',
          dueDate: '2026-04-15',
          priority: 'medium',
          status: 'pending',
        },
      ],
    });
  });
});

describe('schedule routes', () => {
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

  it('returns the authenticated user schedule summary', async () => {
    const get = vi.fn().mockResolvedValue({
      docs: [
        {
          id: 'task-1',
          data: () => ({
            title: 'Math Quiz Review',
            subject: 'Math',
            dueDate: '2099-04-18',
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
      url: '/api/schedule/summary',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      summary: {
        scheduledTasks: 1,
        overdueTasks: 0,
        completedTasks: 0,
      },
      upcoming: [
        {
          id: 'task-1',
          title: 'Math Quiz Review',
          subject: 'Math',
          dueDate: '2099-04-18',
          priority: 'high',
          status: 'pending',
        },
      ],
      overdue: [],
    });

    await app.close();
  });

  it('returns 401 when the bearer token is missing', async () => {
    const app = await buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/api/schedule/summary',
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
