import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'

function renderNavbar(initialPath = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar />
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

describe('Navbar', () => {
  it('renders brand name and tagline', () => {
    renderNavbar()
    expect(screen.getByText('Study Planner')).toBeInTheDocument()
    expect(screen.getByText('Organize your work and stay on track')).toBeInTheDocument()
  })

  it('renders all four nav links', () => {
    renderNavbar()
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tasks' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Schedule' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Progress' })).toBeInTheDocument()
  })

  it('applies active class to Dashboard link on /dashboard', () => {
    renderNavbar('/dashboard')
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveClass('text-indigo-600')
  })

  it('applies active class to Schedule link on /schedule', () => {
    renderNavbar('/schedule')
    expect(screen.getByRole('link', { name: 'Schedule' })).toHaveClass('text-indigo-600')
  })

  it('does not apply active class to inactive links', () => {
    renderNavbar('/dashboard')
    expect(screen.getByRole('link', { name: 'Progress' })).not.toHaveClass('text-indigo-600')
  })

  it('renders the theme toggle button', () => {
    renderNavbar()
    expect(screen.getByRole('button', { name: /switch to/i })).toBeInTheDocument()
  })
})
