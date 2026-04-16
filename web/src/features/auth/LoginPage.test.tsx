import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  mockNavigate.mockClear()
})

describe('LoginPage', () => {
  it('renders the heading and sign in button', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('renders email and password fields', () => {
    renderPage()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('renders a link to the signup page', () => {
    renderPage()
    expect(screen.getByRole('link', { name: 'Create one' })).toHaveAttribute('href', '/signup')
  })

  it('shows an error when email is invalid', () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'notanemail' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address.')
  })

  it('shows an error when password is too short', () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Password must be at least 6 characters.')
  })

  it('shows invalid credentials error when no matching account exists', () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ghost@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password.')
  })

  it('navigates to /dashboard on successful login', () => {
    localStorage.setItem(
      'auth_accounts',
      JSON.stringify([{ name: 'Alice', email: 'alice@example.com', password: 'pass123' }]),
    )
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alice@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pass123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })
})
