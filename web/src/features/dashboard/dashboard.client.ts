import { apiFetch, buildApiUrl, buildAuthHeaders } from '../../lib/api'

export type DashboardDeadline = {
  id: string
  title: string
  dueDate: string
  priority: 'low' | 'medium' | 'high' | null
  status: 'pending' | 'completed'
}

export type DashboardSummary = {
  summary: {
    totalTasks: number
    completedTasks: number
    pendingTasks: number
    highPriorityTasks: number
  }
  upcomingDeadlines: DashboardDeadline[]
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await apiFetch(buildApiUrl('/dashboard/summary'), {
    headers: buildAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to load dashboard data.')
  return res.json() as Promise<DashboardSummary>
}
