import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { Task, TaskFormValues } from './task.types'

const TASKS_COLLECTION = 'tasks'

function taskCollection() {
  return collection(db, TASKS_COLLECTION)
}

function mapTask(taskId: string, data: Partial<Task>): Task {
  return {
    id: taskId,
    title: data.title ?? '',
    subject: data.subject ?? '',
    dueDate: data.dueDate ?? '',
    notes: data.notes ?? '',
    priority: data.priority ?? 'Low',
    completed: data.completed ?? false,
    createdAt: data.createdAt ?? '',
    updatedAt: data.updatedAt ?? '',
  }
}

async function getTask(taskId: string) {
  const snapshot = await getDoc(doc(db, TASKS_COLLECTION, taskId))

  if (!snapshot.exists()) {
    throw new Error('Task not found.')
  }

  return mapTask(snapshot.id, snapshot.data() as Partial<Task>)
}

export async function listTasks() {
  const snapshot = await getDocs(query(taskCollection(), orderBy('createdAt', 'desc')))
  return snapshot.docs.map((taskDoc) => mapTask(taskDoc.id, taskDoc.data() as Partial<Task>))
}

export async function createTask(values: TaskFormValues) {
  const timestamp = new Date().toISOString()
  const payload = {
    ...values,
    completed: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  const taskRef = await addDoc(taskCollection(), payload)
  return mapTask(taskRef.id, payload)
}

export async function updateTask(taskId: string, values: TaskFormValues) {
  const payload = {
    ...values,
    updatedAt: new Date().toISOString(),
  }

  await updateDoc(doc(db, TASKS_COLLECTION, taskId), payload)
  return getTask(taskId)
}

export async function toggleTaskCompletion(taskId: string, completed: boolean) {
  await updateDoc(doc(db, TASKS_COLLECTION, taskId), {
    completed,
    updatedAt: new Date().toISOString(),
  })

  return getTask(taskId)
}

export async function removeTask(taskId: string) {
  await deleteDoc(doc(db, TASKS_COLLECTION, taskId))
}
