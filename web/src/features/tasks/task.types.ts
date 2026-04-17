export type TaskPriority = 'low' | 'medium' | 'high'

export type TaskStatus = 'pending' | 'completed'

export type TaskFormValues = {
  title: string
  subject: string
  dueDate: string
  priority: TaskPriority
}

export type Task = {
  id: string
  title: string
  subject: string | null
  dueDate: string | null
  priority: TaskPriority | null
  status: TaskStatus
}

export type ListTasksParams = {
  status?: TaskStatus | 'all'
  search?: string
  priority?: TaskPriority
  limit?: number
}
