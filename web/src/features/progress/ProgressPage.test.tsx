import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import ProgressPage from './ProgressPage'
import * as progressClient from './progress.client'

vi.mock('./progress.client', () => ({
  fetchProgressOverview: vi.fn(),
}))

const fakeData = {
  summary: { totalTasks: 10, completedTasks: 6, completionRate: 60 },
  subjects: [
    { subject: 'Math', totalTasks: 5, completedTasks: 4, completionRate: 80 },
    { subject: 'History', totalTasks: 3, completedTasks: 1, completionRate: 33.33 },
    { subject: 'Biology', totalTasks: 2, completedTasks: 1, completionRate: 50 },
  ],
}

function renderPage() {
  return render(<ProgressPage />)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ProgressPage', () => {
  it('renders the page title', async () => {
    vi.mocked(progressClient.fetchProgressOverview).mockResolvedValue(fakeData)
    renderPage()
    expect(screen.getByRole('heading', { name: 'Progress' })).toBeInTheDocument()
  })

  it('renders skeleton while loading', () => {
    vi.mocked(progressClient.fetchProgressOverview).mockImplementation(() => new Promise(() => {}))
    renderPage()
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('renders the Completion Overview heading', async () => {
    vi.mocked(progressClient.fetchProgressOverview).mockResolvedValue(fakeData)
    renderPage()
    await waitFor(() => expect(screen.getByText('Completion Overview')).toBeInTheDocument())
  })

  it('renders the completion rate percentage after load', async () => {
    vi.mocked(progressClient.fetchProgressOverview).mockResolvedValue(fakeData)
    renderPage()
    await waitFor(() => expect(screen.getByText('60%')).toBeInTheDocument())
  })

  it('renders the tasks completed value text', async () => {
    vi.mocked(progressClient.fetchProgressOverview).mockResolvedValue(fakeData)
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('6 of 10 tasks completed')).toBeInTheDocument(),
    )
  })

  it('renders the Subject Breakdown heading', async () => {
    vi.mocked(progressClient.fetchProgressOverview).mockResolvedValue(fakeData)
    renderPage()
    await waitFor(() => expect(screen.getByText('Subject Breakdown')).toBeInTheDocument())
  })

  it('renders all subject names', async () => {
    vi.mocked(progressClient.fetchProgressOverview).mockResolvedValue(fakeData)
    renderPage()
    await waitFor(() => expect(screen.getByText('Math')).toBeInTheDocument())
    expect(screen.getByText('History')).toBeInTheDocument()
    expect(screen.getByText('Biology')).toBeInTheDocument()
  })

  it('renders task counts for each subject', async () => {
    vi.mocked(progressClient.fetchProgressOverview).mockResolvedValue(fakeData)
    renderPage()
    await waitFor(() => expect(screen.getByText('5 tasks')).toBeInTheDocument())
    expect(screen.getByText('3 tasks')).toBeInTheDocument()
    expect(screen.getByText('2 tasks')).toBeInTheDocument()
  })

  it('Math bar fills to 100% as the subject with most tasks', async () => {
    vi.mocked(progressClient.fetchProgressOverview).mockResolvedValue(fakeData)
    const { container } = renderPage()
    await waitFor(() => expect(screen.getByText('Math')).toBeInTheDocument())
    const fills = Array.from(container.querySelectorAll('[style]')) as HTMLElement[]
    const maxFill = fills.find((el) => el.style.width === '100%')
    expect(maxFill).toBeDefined()
  })

  it('shows empty message when there are no subjects', async () => {
    vi.mocked(progressClient.fetchProgressOverview).mockResolvedValue({
      ...fakeData,
      subjects: [],
    })
    renderPage()
    await waitFor(() => expect(screen.getByText('No subject data yet.')).toBeInTheDocument())
  })

  it('shows an error banner when the fetch fails', async () => {
    vi.mocked(progressClient.fetchProgressOverview).mockRejectedValue(new Error('Network error'))
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/unable to load progress data/i)).toBeInTheDocument(),
    )
  })
})
