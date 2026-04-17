import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const fakeUser = { userId: 'u1', email: 'alice@example.com' }
const fakeSession = { idToken: 'tok', refreshToken: 'ref', expiresIn: '3600' }

function stubFetchOk(body: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(body),
  }))
}

function stubFetchFail(body: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: false,
    json: () => Promise.resolve(body),
  }))
}

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
  vi.restoreAllMocks()
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

  it('shows an error when email is invalid', async () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'notanemail' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Enter a valid email address.')
  })

  it('shows an error when password is too short', async () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Password must be at least 6 characters.')
  })

  it('shows the server error message on failed login', async () => {
    stubFetchFail({ message: 'Invalid email or password' })
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password')
  })

  it('shows a loading state while the request is in flight', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise(() => {})))
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pass123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByRole('button', { name: 'Signing in…' })).toBeDisabled()
  })

  it('navigates to /dashboard on successful login', async () => {
    stubFetchOk({ user: fakeUser, session: fakeSession })
    renderPage()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alice@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pass123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true }))
  })
})
