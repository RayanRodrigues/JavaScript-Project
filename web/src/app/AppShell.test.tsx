import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AppShell from './AppShell'

function renderAppShell(initialPath = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppShell />
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
    expect(screen.getByText('Study Planner')).toBeInTheDocument()
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

  it('renders page content inside main', () => {
    renderAppShell('/dashboard')
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main.children.length).toBeGreaterThan(0)
  })
})
