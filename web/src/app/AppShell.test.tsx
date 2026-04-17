import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AppShell from './AppShell'

function renderAppShell() {
  return render(
    <MemoryRouter>
      <AppShell>
        <div data-testid="child-content">Test content</div>
      </AppShell>
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

describe('AppShell', () => {
  it('renders the Navbar', () => {
    renderAppShell()
    expect(screen.getAllByText('Study Planner').length).toBeGreaterThanOrEqual(1)
  })

  it('renders a main content area', () => {
    renderAppShell()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('applies dark background class when dark mode is active', () => {
    document.documentElement.classList.add('dark')
    const { container } = renderAppShell()
    const shell = container.firstChild as HTMLElement
    expect(shell).toHaveClass('dark:bg-slate-950')
  })

  it('renders children inside main', () => {
    renderAppShell()
    const main = screen.getByRole('main')
    expect(main).toContainElement(screen.getByTestId('child-content'))
  })
})
