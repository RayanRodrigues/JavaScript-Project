import { getStoredToken } from '../../hooks/useAuth'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

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
  const res = await fetch(`${API_BASE}/dashboard/summary`, {
    headers: { Authorization: `Bearer ${getStoredToken()}` },
  })
  if (!res.ok) throw new Error('Failed to load dashboard data.')
  return res.json() as Promise<DashboardSummary>
}
