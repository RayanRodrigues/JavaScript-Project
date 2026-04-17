import { apiFetch, buildApiUrl, buildAuthHeaders } from '../../lib/api'

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
  const res = await apiFetch(buildApiUrl('/progress/summary'), {
    headers: buildAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to load progress data.')
  return res.json() as Promise<ProgressOverviewResponse>
}
