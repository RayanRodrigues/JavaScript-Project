import { getFirebaseAdminFirestore } from '../../lib/firebase-admin.js';
import {
  taskListResponseSchema,
  taskResponseSchema,
  type CreateTaskBody,
  type Task,
  type UpdateTaskBody,
} from './tasks.schema.js';

export class TaskNotFoundError extends Error {
  constructor() {
    super('Task not found');
  }
}

function normalizePriority(value: unknown): Task['priority'] {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value;
  }

  return null;
}

function normalizeStatus(value: unknown): Task['status'] {
  return value === 'completed' ? 'completed' : 'pending';
}

function normalizeNullableString(value: unknown) {
  return typeof value === 'string' ? value : null;
}

function mapTask(docId: string, userId: string, data: Record<string, unknown>): Task {
  return {
    id: docId,
    userId,
    title: typeof data.title === 'string' && data.title.length > 0 ? data.title : 'Untitled task',
    subject: normalizeNullableString(data.subject),
    dueDate: normalizeNullableString(data.dueDate),
    priority: normalizePriority(data.priority),
    status: normalizeStatus(data.status),
  };
}

export async function listTasksForUser(userId: string) {
  const snapshot = await getFirebaseAdminFirestore()
    .collection('tasks')
    .where('userId', '==', userId)
    .get();

  const tasks = snapshot.docs.map((doc) => mapTask(doc.id, userId, doc.data()));

  return taskListResponseSchema.parse({ tasks });
}

export async function createTaskForUser(userId: string, input: CreateTaskBody) {
  const collection = getFirebaseAdminFirestore().collection('tasks');
  const docRef = collection.doc();
  const payload = {
    userId,
    title: input.title,
    subject: input.subject ?? null,
    dueDate: input.dueDate ?? null,
    priority: input.priority ?? null,
    status: 'pending' as const,
  };

  await docRef.set(payload);

  return taskResponseSchema.parse({
    task: mapTask(docRef.id, userId, payload),
  });
}

async function getOwnedTaskDoc(userId: string, taskId: string) {
  const docRef = getFirebaseAdminFirestore().collection('tasks').doc(taskId);
  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    throw new TaskNotFoundError();
  }

  const data = snapshot.data();

  if (!data || data.userId !== userId) {
    throw new TaskNotFoundError();
  }

  return { docRef, data };
}

export async function updateTaskForUser(userId: string, taskId: string, input: UpdateTaskBody) {
  const { docRef, data } = await getOwnedTaskDoc(userId, taskId);
  const nextData = {
    ...data,
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.subject !== undefined ? { subject: input.subject } : {}),
    ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
    ...(input.priority !== undefined ? { priority: input.priority } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
  };

  await docRef.update(nextData);

  return taskResponseSchema.parse({
    task: mapTask(taskId, userId, nextData),
  });
}

export async function deleteTaskForUser(userId: string, taskId: string) {
  const { docRef } = await getOwnedTaskDoc(userId, taskId);

  await docRef.delete();
}
