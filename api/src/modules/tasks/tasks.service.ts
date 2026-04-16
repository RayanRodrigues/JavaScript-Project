import { getFirebaseAdminFirestore } from '../../lib/firebase-admin.js';
import { taskListResponseSchema, type Task } from './tasks.schema.js';

function normalizePriority(value: unknown): Task['priority'] {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value;
  }

  return null;
}

function normalizeStatus(value: unknown): Task['status'] {
  return value === 'completed' ? 'completed' : 'pending';
}

export async function listTasksForUser(userId: string) {
  const snapshot = await getFirebaseAdminFirestore()
    .collection('tasks')
    .where('userId', '==', userId)
    .get();

  const tasks = snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      userId,
      title: typeof data.title === 'string' && data.title.length > 0 ? data.title : 'Untitled task',
      subject: typeof data.subject === 'string' ? data.subject : null,
      dueDate: typeof data.dueDate === 'string' ? data.dueDate : null,
      priority: normalizePriority(data.priority),
      status: normalizeStatus(data.status),
    };
  });

  return taskListResponseSchema.parse({ tasks });
}
