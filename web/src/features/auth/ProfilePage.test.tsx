import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import ProfilePage from './ProfilePage'

function renderPage() {
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('ProfilePage', () => {
  it('renders the page heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    renderPage()
    expect(screen.getByText('Your account details.')).toBeInTheDocument()
  })

  it('shows the logged-in user email', () => {
    localStorage.setItem(
      'auth_user',
      JSON.stringify({ userId: 'u-abc123', email: 'student@example.com' }),
    )
    renderPage()
    expect(screen.getAllByText('student@example.com').length).toBeGreaterThan(0)
  })

  it('shows the logged-in user id', () => {
    localStorage.setItem(
      'auth_user',
      JSON.stringify({ userId: 'u-abc123', email: 'student@example.com' }),
    )
    renderPage()
    expect(screen.getByText('u-abc123')).toBeInTheDocument()
  })

  it('shows placeholder dashes when no user is stored', () => {
    renderPage()
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThan(0)
  })

  it('shows the Student role badge', () => {
    renderPage()
    expect(screen.getAllByText('Student').length).toBeGreaterThan(0)
  })
})
