import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from './DashboardPage'
import * as dashboardClient from './dashboard.client'

vi.mock('./dashboard.client', () => ({
  fetchDashboardSummary: vi.fn(),
}))

const fakeSummary = {
  summary: {
    totalTasks: 10,
    completedTasks: 6,
    pendingTasks: 4,
    highPriorityTasks: 2,
  },
  upcomingDeadlines: [
    { id: 'd1', title: 'Math Quiz Review', dueDate: '2026-04-18', priority: 'high' as const, status: 'pending' as const },
    { id: 'd2', title: 'History Essay', dueDate: '2026-04-20', priority: 'medium' as const, status: 'pending' as const },
  ],
}

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DashboardPage', () => {
  it('renders the page title', async () => {
    vi.mocked(dashboardClient.fetchDashboardSummary).mockResolvedValue(fakeSummary)
    renderPage()
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('renders skeleton cards while loading', () => {
    vi.mocked(dashboardClient.fetchDashboardSummary).mockImplementation(() => new Promise(() => {}))
    renderPage()
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders all four stat cards after load', async () => {
    vi.mocked(dashboardClient.fetchDashboardSummary).mockResolvedValue(fakeSummary)
    renderPage()
    await waitFor(() => expect(screen.getByText('Total Tasks')).toBeInTheDocument())
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('High Priority')).toBeInTheDocument()
  })

  it('renders the correct stat values from the API', async () => {
    vi.mocked(dashboardClient.fetchDashboardSummary).mockResolvedValue(fakeSummary)
    renderPage()
    await waitFor(() => expect(screen.getByText('10')).toBeInTheDocument())
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders the Upcoming Deadlines section', async () => {
    vi.mocked(dashboardClient.fetchDashboardSummary).mockResolvedValue(fakeSummary)
    renderPage()
    await waitFor(() => expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument())
  })

  it('renders deadline titles from the API', async () => {
    vi.mocked(dashboardClient.fetchDashboardSummary).mockResolvedValue(fakeSummary)
    renderPage()
    await waitFor(() => expect(screen.getByText('Math Quiz Review')).toBeInTheDocument())
    expect(screen.getByText('History Essay')).toBeInTheDocument()
  })

  it('renders the Completion Rate section with calculated percentage', async () => {
    vi.mocked(dashboardClient.fetchDashboardSummary).mockResolvedValue(fakeSummary)
    renderPage()
    await waitFor(() => expect(screen.getByText('Completion Rate')).toBeInTheDocument())
    expect(screen.getByText('60% completed')).toBeInTheDocument()
  })

  it('shows an empty deadlines message when there are none', async () => {
    vi.mocked(dashboardClient.fetchDashboardSummary).mockResolvedValue({
      ...fakeSummary,
      upcomingDeadlines: [],
    })
    renderPage()
    await waitFor(() => expect(screen.getByText('No upcoming deadlines.')).toBeInTheDocument())
  })

  it('shows an error banner when the fetch fails', async () => {
    vi.mocked(dashboardClient.fetchDashboardSummary).mockRejectedValue(new Error('Network error'))
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/unable to load dashboard data/i)).toBeInTheDocument(),
    )
  })
})
