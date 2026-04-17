import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import NotFoundPage from './NotFoundPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>
  )
}

describe('NotFoundPage', () => {
  it('renders the 404 code', () => {
    renderPage()
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders the page not found heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })

  it('renders a helpful description', () => {
    renderPage()
    expect(screen.getByText(/doesn't exist or has been moved/i)).toBeInTheDocument()
  })

  it('renders a link back to the dashboard', () => {
    renderPage()
    const link = screen.getByRole('link', { name: 'Back to Dashboard' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/dashboard')
  })
})
