import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from './DashboardPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  )
}

describe('DashboardPage', () => {
  it('renders the page title', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
  })

  it('renders all three stat values', () => {
    renderPage()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders all three stat labels', () => {
    renderPage()
    expect(screen.getByText('Total Tasks')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders the Upcoming Deadlines section heading', () => {
    renderPage()
    expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument()
  })

  it('renders all three deadline items', () => {
    renderPage()
    expect(screen.getByText('Math Quiz Review')).toBeInTheDocument()
    expect(screen.getByText('History Essay Outline')).toBeInTheDocument()
    expect(screen.getByText('Biology Flashcards')).toBeInTheDocument()
  })

  it('renders the Study Focus section heading', () => {
    renderPage()
    expect(screen.getByText('Study Focus')).toBeInTheDocument()
  })

  it('renders the progress meter with correct value text', () => {
    renderPage()
    expect(screen.getByText('68% completed')).toBeInTheDocument()
  })
})
