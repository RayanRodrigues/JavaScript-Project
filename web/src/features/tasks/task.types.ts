export type TaskPriority = 'Low' | 'Medium' | 'High'

export interface TaskFormValues {
  title: string
  subject: string
  dueDate: string
  notes: string
  priority: TaskPriority
}

export interface Task extends TaskFormValues {
  id: string
  completed: boolean
  createdAt: string
  updatedAt: string
}
