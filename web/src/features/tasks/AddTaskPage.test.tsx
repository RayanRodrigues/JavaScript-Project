import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import AddTaskPage from './AddTaskPage'

function renderPage() {
  return render(<AddTaskPage />)
}

describe('AddTaskPage', () => {
  it('renders the page title', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Add Task' })).toBeInTheDocument()
  })

  it('renders all form fields', () => {
    renderPage()
    expect(screen.getByLabelText('Task Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Subject')).toBeInTheDocument()
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument()
    expect(screen.getByLabelText('Notes')).toBeInTheDocument()
  })

  it('renders all three priority pills', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Low' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Medium' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'High' })).toBeInTheDocument()
  })

  it('defaults to Low priority', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Low' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Medium' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'High' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('selects Medium when clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Medium' }))

    expect(screen.getByRole('button', { name: 'Medium' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Low' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'High' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('selects High when clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'High' }))

    expect(screen.getByRole('button', { name: 'High' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Low' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Medium' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('renders the Save Task submit button', () => {
    renderPage()
    const btn = screen.getByRole('button', { name: 'Save Task' })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('type', 'submit')
  })
})
