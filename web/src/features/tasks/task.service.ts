import { apiFetch, buildApiUrl, buildAuthHeaders } from '../../lib/api'
import type { Task, TaskFormValues, ListTasksParams } from './task.types'

function authHeaders() {
  return buildAuthHeaders({ 'Content-Type': 'application/json' })
}

export async function listTasks(params: ListTasksParams = {}): Promise<Task[]> {
  const query = new URLSearchParams()
  if (params.status) query.set('status', params.status)
  if (params.search) query.set('search', params.search)
  if (params.priority) query.set('priority', params.priority)
  if (params.limit !== undefined) query.set('limit', String(params.limit))

  const res = await apiFetch(`${buildApiUrl('/tasks')}?${query}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to load tasks.')
  const data = (await res.json()) as { tasks: Task[] }
  return data.tasks
}

export async function createTask(values: TaskFormValues): Promise<Task> {
  const res = await apiFetch(buildApiUrl('/tasks'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      title: values.title,
      subject: values.subject || null,
      dueDate: values.dueDate || null,
      priority: values.priority || null,
    }),
  })
  if (!res.ok) throw new Error('Failed to create task.')
  const data = (await res.json()) as { task: Task }
  return data.task
}

export async function updateTask(taskId: string, values: TaskFormValues): Promise<Task> {
  const res = await apiFetch(buildApiUrl(`/tasks/${taskId}`), {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({
      title: values.title,
      subject: values.subject || null,
      dueDate: values.dueDate || null,
      priority: values.priority || null,
    }),
  })
  if (!res.ok) throw new Error('Failed to update task.')
  const data = (await res.json()) as { task: Task }
  return data.task
}

export async function toggleTaskCompletion(taskId: string, completed: boolean): Promise<Task> {
  const res = await apiFetch(buildApiUrl(`/tasks/${taskId}`), {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status: completed ? 'completed' : 'pending' }),
  })
  if (!res.ok) throw new Error('Failed to update task status.')
  const data = (await res.json()) as { task: Task }
  return data.task
}

export async function removeTask(taskId: string): Promise<void> {
  const res = await apiFetch(buildApiUrl(`/tasks/${taskId}`), {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete task.')
}
