import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AlertBanner from './AlertBanner'
import PageHeader from './PageHeader'
import ProgressMeter from './ProgressMeter'
import SummaryList from './SummaryList'

// --- AlertBanner ---

describe('AlertBanner', () => {
  it('renders the message text', () => {
    render(<AlertBanner variant="error" message="Something went wrong." />)
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.')
  })

  it('renders with role="alert"', () => {
    render(<AlertBanner variant="success" message="Task saved." />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('applies error styles for error variant', () => {
    render(<AlertBanner variant="error" message="Oops" />)
    expect(screen.getByRole('alert')).toHaveClass('text-rose-700')
  })

  it('applies success styles for success variant', () => {
    render(<AlertBanner variant="success" message="Done" />)
    expect(screen.getByRole('alert')).toHaveClass('text-emerald-700')
  })
})

// --- PageHeader ---

describe('PageHeader', () => {
  it('renders title and subtitle', () => {
    render(<PageHeader title="Dashboard" subtitle="Overview of your tasks" />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Overview of your tasks')).toBeInTheDocument()
  })

  it('uses h2 for the title', () => {
    render(<PageHeader title="Progress" subtitle="Track your work" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Progress' })).toBeInTheDocument()
  })
})

// --- ProgressMeter ---

describe('ProgressMeter', () => {
  it('renders label and value text', () => {
    render(<ProgressMeter label="Weekly Goal" valueText="68% completed" percentage={68} />)
    expect(screen.getByText('Weekly Goal')).toBeInTheDocument()
    expect(screen.getByText('68% completed')).toBeInTheDocument()
  })

  it('sets fill width from percentage prop', () => {
    const { container } = render(
      <ProgressMeter label="Goal" valueText="50%" percentage={50} />,
    )
    const fill = container.querySelector('[style]') as HTMLElement
    expect(fill.style.width).toBe('50%')
  })

  it('clamps percentage above 100 to 100%', () => {
    const { container } = render(
      <ProgressMeter label="Goal" valueText="done" percentage={150} />,
    )
    const fill = container.querySelector('[style]') as HTMLElement
    expect(fill.style.width).toBe('100%')
  })

  it('clamps percentage below 0 to 0%', () => {
    const { container } = render(
      <ProgressMeter label="Goal" valueText="none" percentage={-10} />,
    )
    const fill = container.querySelector('[style]') as HTMLElement
    expect(fill.style.width).toBe('0%')
  })

  it('applies gradient class for default tone', () => {
    const { container } = render(
      <ProgressMeter label="Goal" valueText="done" percentage={60} />,
    )
    const fill = container.querySelector('[style]') as HTMLElement
    expect(fill).toHaveClass('from-indigo-500')
    expect(fill).toHaveClass('to-emerald-500')
  })

  it('applies solid green class for success tone', () => {
    const { container } = render(
      <ProgressMeter label="Goal" valueText="done" percentage={80} tone="success" />,
    )
    const fill = container.querySelector('[style]') as HTMLElement
    expect(fill).toHaveClass('bg-emerald-500')
    expect(fill).not.toHaveClass('from-indigo-500')
  })
})

// --- SummaryList ---

describe('SummaryList', () => {
  const items = [
    { label: 'Math Quiz Review', value: 'Apr 18' },
    { label: 'History Essay', value: 'Apr 19' },
    { label: 'Biology Flashcards', value: 'Apr 20' },
  ]

  it('renders all item labels and values', () => {
    render(<SummaryList items={items} />)
    expect(screen.getByText('Math Quiz Review')).toBeInTheDocument()
    expect(screen.getByText('History Essay')).toBeInTheDocument()
    expect(screen.getByText('Biology Flashcards')).toBeInTheDocument()
    expect(screen.getByText('Apr 18')).toBeInTheDocument()
    expect(screen.getByText('Apr 19')).toBeInTheDocument()
    expect(screen.getByText('Apr 20')).toBeInTheDocument()
  })

  it('renders correct number of list items', () => {
    render(<SummaryList items={items} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('renders an empty list when no items given', () => {
    render(<SummaryList items={[]} />)
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})
