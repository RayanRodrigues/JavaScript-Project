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
  priority: 'medium',
  status: 'pending',
}

function renderPage() {
  return render(<AddTaskPage />)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(taskService.listTasks).mockResolvedValue([existingTask])
  vi.mocked(taskService.createTask).mockImplementation(async (values) => ({
    id: 'task-2',
    title: values.title,
    subject: values.subject || null,
    dueDate: values.dueDate || null,
    priority: values.priority,
    status: 'pending',
  }))
  vi.mocked(taskService.updateTask).mockImplementation(async (taskId, values) => ({
    id: taskId,
    title: values.title,
    subject: values.subject || null,
    dueDate: values.dueDate || null,
    priority: values.priority,
    status: 'pending',
  }))
  vi.mocked(taskService.toggleTaskCompletion).mockImplementation(async (taskId, completed) => ({
    ...existingTask,
    id: taskId,
    status: completed ? 'completed' : 'pending',
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

  it('loads pending tasks by default', async () => {
    renderPage()

    await waitFor(() =>
      expect(taskService.listTasks).toHaveBeenCalledWith({
        search: undefined,
        status: 'pending',
        limit: 20,
      }),
    )
  })

  it('renders the current task form fields', () => {
    renderPage()

    expect(screen.getByLabelText('Task Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Subject')).toBeInTheDocument()
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search tasks…')).toBeInTheDocument()
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
  })

  it('creates a task through the service', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText('Task Title'), 'Prepare history essay')
    await user.type(screen.getByLabelText('Subject'), 'History')
    await user.type(screen.getByLabelText('Due Date'), '2026-04-24')
    await user.click(screen.getByRole('button', { name: 'High' }))
    await user.click(screen.getByRole('button', { name: 'Save Task' }))

    await waitFor(() =>
      expect(taskService.createTask).toHaveBeenCalledWith({
        title: 'Prepare history essay',
        subject: 'History',
        dueDate: '2026-04-24',
        priority: 'high',
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
        priority: 'medium',
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

    const button = screen.getByRole('button', { name: 'Save Task' })

    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('type', 'submit')
  })
})
