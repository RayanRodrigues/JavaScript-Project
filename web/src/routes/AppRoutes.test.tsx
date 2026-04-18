import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AppRoutes } from './AppRoutes'

const mockUseAuth = vi.fn()

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

function renderRoutes(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppRoutes />
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
  mockUseAuth.mockReturnValue({
    user: null,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    getToken: vi.fn(),
  })
})

describe('AppRoutes', () => {
  it('renders the custom 404 page for an invalid URL', () => {
    renderRoutes('/missing-page')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })

  it('redirects protected routes to the login page when unauthenticated', async () => {
    renderRoutes('/dashboard')
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
  })
})
