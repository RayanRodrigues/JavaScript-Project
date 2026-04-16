import { getStoredToken } from '../../hooks/useAuth'
import { buildApiUrl } from '../../lib/api'

export type ProgressSubject = {
  subject: string
  totalTasks: number
  completedTasks: number
  completionRate: number
}

export type ProgressOverviewResponse = {
  summary: {
    totalTasks: number
    completedTasks: number
    completionRate: number
  }
  subjects: ProgressSubject[]
}

export async function fetchProgressOverview(): Promise<ProgressOverviewResponse> {
  const res = await fetch(buildApiUrl('/progress/summary'), {
    headers: { Authorization: `Bearer ${getStoredToken()}` },
  })
  if (!res.ok) throw new Error('Failed to load progress data.')
  return res.json() as Promise<ProgressOverviewResponse>
}
