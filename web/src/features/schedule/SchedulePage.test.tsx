import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import SchedulePage from './SchedulePage'

function renderPage() {
  return render(
    <MemoryRouter>
      <SchedulePage />
    </MemoryRouter>,
  )
}

describe('SchedulePage', () => {
  it('renders the page title', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Study Schedule' })).toBeInTheDocument()
  })

  it('renders the This Week section heading', () => {
    renderPage()
    expect(screen.getByText('This Week')).toBeInTheDocument()
  })

  it('renders all three day badges', () => {
    renderPage()
    expect(screen.getByText('Monday')).toBeInTheDocument()
    expect(screen.getByText('Wednesday')).toBeInTheDocument()
    expect(screen.getByText('Friday')).toBeInTheDocument()
  })

  it('renders all three session descriptions', () => {
    renderPage()
    expect(screen.getByText('Math practice and note review')).toBeInTheDocument()
    expect(screen.getByText('History reading and outline prep')).toBeInTheDocument()
    expect(screen.getByText('Biology flashcards and quiz review')).toBeInTheDocument()
  })

  it('renders all three session times', () => {
    renderPage()
    expect(screen.getByText('6:00 PM')).toBeInTheDocument()
    expect(screen.getByText('5:30 PM')).toBeInTheDocument()
    expect(screen.getByText('4:00 PM')).toBeInTheDocument()
  })

  it('Monday item has indigo accent class', () => {
    renderPage()
    const monday = screen.getByText('Monday')
    const item = monday.closest('[class*="border-l-4"]') as HTMLElement
    expect(item).toHaveClass('border-indigo-500')
  })

  it('Wednesday item has violet accent class', () => {
    renderPage()
    const wednesday = screen.getByText('Wednesday')
    const item = wednesday.closest('[class*="border-l-4"]') as HTMLElement
    expect(item).toHaveClass('border-violet-500')
  })

  it('Friday item has teal accent class', () => {
    renderPage()
    const friday = screen.getByText('Friday')
    const item = friday.closest('[class*="border-l-4"]') as HTMLElement
    expect(item).toHaveClass('border-teal-500')
  })
})
