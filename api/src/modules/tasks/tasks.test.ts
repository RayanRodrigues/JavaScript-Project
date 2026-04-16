import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../app/app.js';
import {
  createTaskForUser,
  deleteTaskForUser,
  listTasksForUser,
  TaskNotFoundError,
  updateTaskForUser,
} from './tasks.service.js';

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

describe('tasks service', () => {
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

  it('lists only the authenticated user tasks from Firestore', async () => {
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

    getFirestore.mockReturnValue({ collection });

    await expect(listTasksForUser('user-123')).resolves.toEqual({
      tasks: [
        {
          id: 'task-1',
          userId: 'user-123',
          title: 'Math Quiz Review',
          subject: 'Math',
          dueDate: '2026-04-18',
          priority: 'high',
          status: 'pending',
        },
      ],
    });

    expect(collection).toHaveBeenCalledWith('tasks');
    expect(where).toHaveBeenCalledWith('userId', '==', 'user-123');
  });

  it('creates a task using the authenticated user as source of truth', async () => {
    const set = vi.fn().mockResolvedValue(undefined);
    const docRef = { id: 'task-2', set };
    const doc = vi.fn(() => docRef);
    const collection = vi.fn(() => ({ doc }));

    getFirestore.mockReturnValue({ collection });

    await expect(
      createTaskForUser('user-123', {
        title: 'Biology Flashcards',
        subject: 'Biology',
        dueDate: '2026-04-20',
        priority: 'medium',
      }),
    ).resolves.toEqual({
      task: {
        id: 'task-2',
        userId: 'user-123',
        title: 'Biology Flashcards',
        subject: 'Biology',
        dueDate: '2026-04-20',
        priority: 'medium',
        status: 'pending',
      },
    });
  });

  it('updates an owned task', async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const get = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        userId: 'user-123',
        title: 'Math Quiz Review',
        subject: 'Math',
        dueDate: '2026-04-18',
        priority: 'high',
        status: 'pending',
      }),
    });
    const doc = vi.fn(() => ({ get, update }));
    const collection = vi.fn(() => ({ doc }));

    getFirestore.mockReturnValue({ collection });

    await expect(
      updateTaskForUser('user-123', 'task-1', {
        status: 'completed',
      }),
    ).resolves.toEqual({
      task: {
        id: 'task-1',
        userId: 'user-123',
        title: 'Math Quiz Review',
        subject: 'Math',
        dueDate: '2026-04-18',
        priority: 'high',
        status: 'completed',
      },
    });
  });

  it('throws when trying to delete a task owned by another user', async () => {
    const deleteFn = vi.fn().mockResolvedValue(undefined);
    const get = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        userId: 'other-user',
      }),
    });
    const doc = vi.fn(() => ({ get, delete: deleteFn }));
    const collection = vi.fn(() => ({ doc }));

    getFirestore.mockReturnValue({ collection });

    await expect(deleteTaskForUser('user-123', 'task-1')).rejects.toBeInstanceOf(TaskNotFoundError);
  });
});

describe('tasks routes', () => {
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

  it('returns tasks for an authenticated user', async () => {
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
      url: '/tasks',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      tasks: [
        {
          id: 'task-1',
          userId: 'user-123',
          title: 'Math Quiz Review',
          subject: 'Math',
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
      url: '/tasks',
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

  it('creates a task for an authenticated user', async () => {
    const set = vi.fn().mockResolvedValue(undefined);
    const doc = vi.fn(() => ({ id: 'task-2', set }));
    const collection = vi.fn(() => ({ doc }));

    verifyIdToken.mockResolvedValue({
      uid: 'user-123',
      email: 'student@example.com',
    });
    getFirestore.mockReturnValue({ collection });

    const app = await buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/tasks',
      headers: {
        authorization: 'Bearer valid-token',
      },
      payload: {
        title: 'Biology Flashcards',
        subject: 'Biology',
        dueDate: '2026-04-20',
        priority: 'medium',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      task: {
        id: 'task-2',
        userId: 'user-123',
        title: 'Biology Flashcards',
        subject: 'Biology',
        dueDate: '2026-04-20',
        priority: 'medium',
        status: 'pending',
      },
    });

    await app.close();
  });

  it('updates an authenticated user task', async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const get = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        userId: 'user-123',
        title: 'Math Quiz Review',
        subject: 'Math',
        dueDate: '2026-04-18',
        priority: 'high',
        status: 'pending',
      }),
    });
    const doc = vi.fn(() => ({ get, update }));
    const collection = vi.fn(() => ({ doc }));

    verifyIdToken.mockResolvedValue({
      uid: 'user-123',
      email: 'student@example.com',
    });
    getFirestore.mockReturnValue({ collection });

    const app = await buildApp();
    const response = await app.inject({
      method: 'PATCH',
      url: '/tasks/task-1',
      headers: {
        authorization: 'Bearer valid-token',
      },
      payload: {
        status: 'completed',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      task: {
        id: 'task-1',
        userId: 'user-123',
        title: 'Math Quiz Review',
        subject: 'Math',
        dueDate: '2026-04-18',
        priority: 'high',
        status: 'completed',
      },
    });

    await app.close();
  });

  it('deletes an authenticated user task', async () => {
    const deleteFn = vi.fn().mockResolvedValue(undefined);
    const get = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        userId: 'user-123',
      }),
    });
    const doc = vi.fn(() => ({ get, delete: deleteFn }));
    const collection = vi.fn(() => ({ doc }));

    verifyIdToken.mockResolvedValue({
      uid: 'user-123',
      email: 'student@example.com',
    });
    getFirestore.mockReturnValue({ collection });

    const app = await buildApp();
    const response = await app.inject({
      method: 'DELETE',
      url: '/tasks/task-1',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    expect(response.statusCode).toBe(204);

    await app.close();
  });

  it('returns 400 for invalid task creation payload', async () => {
    verifyIdToken.mockResolvedValue({
      uid: 'user-123',
      email: 'student@example.com',
    });

    const app = await buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/tasks',
      headers: {
        authorization: 'Bearer valid-token',
      },
      payload: {
        title: '',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('invalid_request');
    expect(response.json().error.message).toBe('Invalid request data');
    expect(response.json().error.issues).toBeTruthy();

    await app.close();
  });

  it('returns 400 for invalid dueDate format', async () => {
    verifyIdToken.mockResolvedValue({
      uid: 'user-123',
      email: 'student@example.com',
    });

    const app = await buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/tasks',
      headers: {
        authorization: 'Bearer valid-token',
      },
      payload: {
        title: 'Biology Flashcards',
        dueDate: '20/04/2026',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('invalid_request');

    await app.close();
  });

  it('returns 400 for unexpected task payload fields', async () => {
    verifyIdToken.mockResolvedValue({
      uid: 'user-123',
      email: 'student@example.com',
    });

    const app = await buildApp();
    const response = await app.inject({
      method: 'POST',
      url: '/tasks',
      headers: {
        authorization: 'Bearer valid-token',
      },
      payload: {
        title: 'Biology Flashcards',
        userId: 'forged-user',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('invalid_request');

    await app.close();
  });

  it('returns 400 when update payload is empty', async () => {
    verifyIdToken.mockResolvedValue({
      uid: 'user-123',
      email: 'student@example.com',
    });

    const app = await buildApp();
    const response = await app.inject({
      method: 'PATCH',
      url: '/tasks/task-1',
      headers: {
        authorization: 'Bearer valid-token',
      },
      payload: {},
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('invalid_request');

    await app.close();
  });

  it('returns 404 when updating a task from another user', async () => {
    const get = vi.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        userId: 'other-user',
      }),
    });
    const doc = vi.fn(() => ({ get, update: vi.fn() }));
    const collection = vi.fn(() => ({ doc }));

    verifyIdToken.mockResolvedValue({
      uid: 'user-123',
      email: 'student@example.com',
    });
    getFirestore.mockReturnValue({ collection });

    const app = await buildApp();
    const response = await app.inject({
      method: 'PATCH',
      url: '/tasks/task-1',
      headers: {
        authorization: 'Bearer valid-token',
      },
      payload: {
        status: 'completed',
      },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: 'task_not_found',
        message: 'Task not found',
      },
    });

    await app.close();
  });
});
