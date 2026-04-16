import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import CreateAccountPage from './CreateAccountPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderPage() {
  return render(
    <MemoryRouter>
      <CreateAccountPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  mockNavigate.mockClear()
})

describe('CreateAccountPage', () => {
  it('renders the heading and submit button', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument()
  })

  it('renders name, email and password fields', () => {
    renderPage()
    expect(screen.getByLabelText('Full name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('renders a link to the login page', () => {
    renderPage()
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login')
  })

  it('shows an error when name is empty', () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required.')
  })

  it('shows an error when email is invalid', () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Alice' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'notanemail' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email address.')
  })

  it('shows an error when password is too short', () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Alice' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Password must be at least 6 characters.')
  })

  it('shows an error when email is already registered', () => {
    localStorage.setItem(
      'auth_accounts',
      JSON.stringify([{ name: 'Alice', email: 'alice@example.com', password: 'pass123' }]),
    )
    renderPage()
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Alice 2' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alice@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'newpass1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByRole('alert')).toHaveTextContent('An account with this email already exists.')
  })

  it('navigates to /dashboard on successful signup', () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Bob' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'bob@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'mypassword' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })
})
