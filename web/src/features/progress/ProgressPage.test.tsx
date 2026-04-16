import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProgressPage from './ProgressPage'

function renderPage() {
  return render(<ProgressPage />)
}

describe('ProgressPage', () => {
  it('renders the page title', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Progress' })).toBeInTheDocument()
  })

  it('renders the Completion Overview heading', () => {
    renderPage()
    expect(screen.getByText('Completion Overview')).toBeInTheDocument()
  })

  it('renders the large completion percentage', () => {
    renderPage()
    expect(screen.getByText('58%')).toBeInTheDocument()
  })

  it('renders the progress meter value text', () => {
    renderPage()
    expect(screen.getByText('of all tasks completed')).toBeInTheDocument()
  })

  it('renders the Subject Breakdown heading', () => {
    renderPage()
    expect(screen.getByText('Subject Breakdown')).toBeInTheDocument()
  })

  it('renders all three subject labels', () => {
    renderPage()
    expect(screen.getByText('Math')).toBeInTheDocument()
    expect(screen.getByText('History')).toBeInTheDocument()
    expect(screen.getByText('Biology')).toBeInTheDocument()
  })

  it('renders task counts for each subject', () => {
    renderPage()
    expect(screen.getByText('4 tasks')).toBeInTheDocument()
    expect(screen.getByText('3 tasks')).toBeInTheDocument()
    expect(screen.getByText('5 tasks')).toBeInTheDocument()
  })

  it('Biology bar fills to 100% as the max subject', () => {
    const { container } = renderPage()
    const fills = container.querySelectorAll('[style]')
    const biologyFill = Array.from(fills).find(
      (el) => (el as HTMLElement).style.width === '100%',
    ) as HTMLElement
    expect(biologyFill).toBeDefined()
  })

  it('History bar is proportionally narrower than Math', () => {
    const { container } = renderPage()
    const fills = Array.from(container.querySelectorAll('[style]')) as HTMLElement[]
    const widths = fills
      .map((el) => parseFloat(el.style.width))
      .filter((w) => !isNaN(w))
    // Math=80%, History=60%, Biology=100% plus the ProgressMeter fill (58%)
    expect(widths).toContain(80)
    expect(widths).toContain(60)
    expect(widths).toContain(100)
  })
})
