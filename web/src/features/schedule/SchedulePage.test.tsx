import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import SchedulePage from './SchedulePage'
import * as scheduleClient from './schedule.client'

vi.mock('./schedule.client', () => ({
  fetchScheduleSummary: vi.fn(),
}))

const fakeData = {
  summary: { scheduledTasks: 5, overdueTasks: 2, completedTasks: 3 },
  upcoming: [
    {
      id: 'u1',
      title: 'Math Quiz Review',
      subject: 'Math',
      dueDate: '2026-04-25',
      priority: 'high' as const,
      status: 'pending' as const,
    },
    {
      id: 'u2',
      title: 'History Reading',
      subject: 'History',
      dueDate: '2026-04-28',
      priority: 'medium' as const,
      status: 'pending' as const,
    },
  ],
  overdue: [
    {
      id: 'o1',
      title: 'Biology Lab Report',
      subject: 'Biology',
      dueDate: '2026-04-10',
      priority: 'high' as const,
      status: 'pending' as const,
    },
  ],
}

function renderPage() {
  return render(
    <MemoryRouter>
      <SchedulePage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('SchedulePage', () => {
  it('renders the page title', async () => {
    vi.mocked(scheduleClient.fetchScheduleSummary).mockResolvedValue(fakeData)
    renderPage()
    expect(screen.getByRole('heading', { name: 'Study Schedule' })).toBeInTheDocument()
  })

  it('renders skeleton cards while loading', () => {
    vi.mocked(scheduleClient.fetchScheduleSummary).mockImplementation(() => new Promise(() => {}))
    renderPage()
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('renders all three stat labels after load', async () => {
    vi.mocked(scheduleClient.fetchScheduleSummary).mockResolvedValue(fakeData)
    renderPage()
    await waitFor(() => expect(screen.getByText('Scheduled')).toBeInTheDocument())
    // 'Overdue' appears as both a stat label and a section heading
    expect(screen.getAllByText('Overdue').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('renders the correct stat values from the API', async () => {
    vi.mocked(scheduleClient.fetchScheduleSummary).mockResolvedValue(fakeData)
    renderPage()
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument())
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders the Upcoming section heading', async () => {
    vi.mocked(scheduleClient.fetchScheduleSummary).mockResolvedValue(fakeData)
    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Upcoming' })).toBeInTheDocument(),
    )
  })

  it('renders the Overdue section heading', async () => {
    vi.mocked(scheduleClient.fetchScheduleSummary).mockResolvedValue(fakeData)
    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Overdue' })).toBeInTheDocument(),
    )
  })

  it('renders upcoming task titles', async () => {
    vi.mocked(scheduleClient.fetchScheduleSummary).mockResolvedValue(fakeData)
    renderPage()
    await waitFor(() => expect(screen.getByText('Math Quiz Review')).toBeInTheDocument())
    expect(screen.getByText('History Reading')).toBeInTheDocument()
  })

  it('renders overdue task titles', async () => {
    vi.mocked(scheduleClient.fetchScheduleSummary).mockResolvedValue(fakeData)
    renderPage()
    await waitFor(() => expect(screen.getByText('Biology Lab Report')).toBeInTheDocument())
  })

  it('renders subject names for tasks that have one', async () => {
    vi.mocked(scheduleClient.fetchScheduleSummary).mockResolvedValue(fakeData)
    renderPage()
    await waitFor(() => expect(screen.getByText('Math')).toBeInTheDocument())
    expect(screen.getByText('Biology')).toBeInTheDocument()
  })

  it('renders priority badges', async () => {
    vi.mocked(scheduleClient.fetchScheduleSummary).mockResolvedValue(fakeData)
    renderPage()
    await waitFor(() => {
      expect(screen.getAllByText('High').length).toBeGreaterThan(0)
    })
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('shows empty message when there are no upcoming tasks', async () => {
    vi.mocked(scheduleClient.fetchScheduleSummary).mockResolvedValue({
      ...fakeData,
      upcoming: [],
    })
    renderPage()
    await waitFor(() => expect(screen.getByText('No upcoming tasks.')).toBeInTheDocument())
  })

  it('shows empty message when there are no overdue tasks', async () => {
    vi.mocked(scheduleClient.fetchScheduleSummary).mockResolvedValue({
      ...fakeData,
      overdue: [],
    })
    renderPage()
    await waitFor(() => expect(screen.getByText('No overdue tasks.')).toBeInTheDocument())
  })

  it('shows an error banner when the fetch fails', async () => {
    vi.mocked(scheduleClient.fetchScheduleSummary).mockRejectedValue(new Error('Network error'))
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/unable to load schedule/i)).toBeInTheDocument(),
    )
  })
})
