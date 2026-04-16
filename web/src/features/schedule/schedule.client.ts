import { getStoredToken } from '../../hooks/useAuth'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export type ScheduleTask = {
  id: string
  title: string
  subject: string | null
  dueDate: string
  priority: 'low' | 'medium' | 'high' | null
  status: 'pending' | 'completed'
}

export type ScheduleSummaryResponse = {
  summary: {
    scheduledTasks: number
    overdueTasks: number
    completedTasks: number
  }
  upcoming: ScheduleTask[]
  overdue: ScheduleTask[]
}

export async function fetchScheduleSummary(): Promise<ScheduleSummaryResponse> {
  const res = await fetch(`${API_BASE}/schedule/summary`, {
    headers: { Authorization: `Bearer ${getStoredToken()}` },
  })
  if (!res.ok) throw new Error('Failed to load schedule data.')
  return res.json() as Promise<ScheduleSummaryResponse>
}
