import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AddTaskPage from './AddTaskPage'
import * as taskService from './task.service'
import type { Task } from './task.types'

vi.mock('./task.service', () => ({
  createTask: vi.fn(),
  listTasks: vi.fn(),
  removeTask: vi.fn(),
  toggleTaskCompletion: vi.fn(),
  updateTask: vi.fn(),
}))

const existingTask: Task = {
  id: 'task-1',
  title: 'Read calculus chapter',
  subject: 'Math',
  dueDate: '2026-04-20',
  notes: 'Focus on limits',
  priority: 'Medium',
  completed: false,
  createdAt: '2026-04-16T10:00:00.000Z',
  updatedAt: '2026-04-16T10:00:00.000Z',
}

function renderPage() {
  return render(<AddTaskPage />)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(taskService.listTasks).mockResolvedValue([existingTask])
  vi.mocked(taskService.createTask).mockImplementation(async (values) => ({
    id: 'task-2',
    ...values,
    completed: false,
    createdAt: '2026-04-16T11:00:00.000Z',
    updatedAt: '2026-04-16T11:00:00.000Z',
  }))
  vi.mocked(taskService.updateTask).mockImplementation(async (taskId, values) => ({
    id: taskId,
    ...values,
    completed: false,
    createdAt: existingTask.createdAt,
    updatedAt: '2026-04-16T11:30:00.000Z',
  }))
  vi.mocked(taskService.toggleTaskCompletion).mockImplementation(async (taskId, completed) => ({
    ...existingTask,
    id: taskId,
    completed,
    updatedAt: '2026-04-16T12:00:00.000Z',
  }))
  vi.mocked(taskService.removeTask).mockResolvedValue(undefined)
  vi.stubGlobal('confirm', vi.fn(() => true))
})

describe('AddTaskPage', () => {
  it('renders the page title', async () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Tasks' })).toBeInTheDocument()
    expect(await screen.findByText('Read calculus chapter')).toBeInTheDocument()
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

  it('creates a task through the service', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Task Title'), 'Prepare history essay')
    await user.type(screen.getByLabelText('Subject'), 'History')
    await user.type(screen.getByLabelText('Due Date'), '2026-04-24')
    await user.type(screen.getByLabelText('Notes'), 'Outline first draft')
    await user.click(screen.getByRole('button', { name: 'High' }))
    await user.click(screen.getByRole('button', { name: 'Save Task' }))

    await waitFor(() =>
      expect(taskService.createTask).toHaveBeenCalledWith({
        title: 'Prepare history essay',
        subject: 'History',
        dueDate: '2026-04-24',
        notes: 'Outline first draft',
        priority: 'High',
      }),
    )

    expect(await screen.findByText('Task created.')).toBeInTheDocument()
    expect(screen.getByLabelText('Task Title')).toHaveValue('')
    expect(screen.getByLabelText('Subject')).toHaveValue('')
  })

  it('loads a task into the form for editing and updates it', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Edit' }))

    expect(screen.getByDisplayValue('Read calculus chapter')).toBeInTheDocument()

    const titleInput = screen.getByLabelText('Task Title')
    await user.clear(titleInput)
    await user.type(titleInput, 'Review calculus exercises')
    await user.click(screen.getByRole('button', { name: 'Update Task' }))

    await waitFor(() =>
      expect(taskService.updateTask).toHaveBeenCalledWith('task-1', {
        title: 'Review calculus exercises',
        subject: 'Math',
        dueDate: '2026-04-20',
        notes: 'Focus on limits',
        priority: 'Medium',
      }),
    )
  })

  it('toggles task completion', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Mark complete' }))

    await waitFor(() =>
      expect(taskService.toggleTaskCompletion).toHaveBeenCalledWith('task-1', true),
    )

    expect(await screen.findByText('Completed')).toBeInTheDocument()
  })

  it('deletes a task after confirmation', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(taskService.removeTask).toHaveBeenCalledWith('task-1'))
    expect(screen.queryByText('Read calculus chapter')).not.toBeInTheDocument()
  })

  it('renders the save task submit button', () => {
    renderPage()
    const btn = screen.getByRole('button', { name: 'Save Task' })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('type', 'submit')
  })
})
