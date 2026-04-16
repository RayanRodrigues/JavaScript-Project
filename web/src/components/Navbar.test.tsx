import { render, screen, fireEvent } from '@testing-library/react'
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

function renderNavbarWithUser() {
  localStorage.setItem(
    'auth_user',
    JSON.stringify({ userId: 'u-1', email: 'student@example.com' }),
  )
  return renderNavbar()
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

  it('does not render account menu when no user is logged in', () => {
    renderNavbar()
    expect(screen.queryByRole('button', { name: 'Account menu' })).not.toBeInTheDocument()
  })

  it('renders account menu trigger when a user is logged in', () => {
    renderNavbarWithUser()
    expect(screen.getByRole('button', { name: 'Account menu' })).toBeInTheDocument()
  })

  it('shows user email initial in the avatar', () => {
    renderNavbarWithUser()
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  it('opens the dropdown when the account button is clicked', () => {
    renderNavbarWithUser()
    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('dropdown shows signed-in email', () => {
    renderNavbarWithUser()
    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }))
    expect(screen.getByText('student@example.com')).toBeInTheDocument()
  })

  it('dropdown contains a View profile link', () => {
    renderNavbarWithUser()
    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }))
    expect(screen.getByRole('menuitem', { name: /view profile/i })).toBeInTheDocument()
  })

  it('dropdown contains a Sign out button', () => {
    renderNavbarWithUser()
    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }))
    expect(screen.getByRole('menuitem', { name: /sign out/i })).toBeInTheDocument()
  })

  it('closes the dropdown when clicked again', () => {
    renderNavbarWithUser()
    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Account menu' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })
})
