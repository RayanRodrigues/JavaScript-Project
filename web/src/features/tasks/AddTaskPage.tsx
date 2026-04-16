import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import PageHeader from '../../components/PageHeader'
import TaskCard from './TaskCard'
import {
  createTask,
  listTasks,
  removeTask,
  toggleTaskCompletion,
  updateTask,
} from './task.service'
import type { Task, TaskFormValues, TaskPriority, TaskStatus } from './task.types'

const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']

const PRIORITY_PILL_SELECTED: Record<TaskPriority, string> = {
  low: 'bg-emerald-500 text-white border-transparent',
  medium: 'bg-amber-500 text-white border-transparent',
  high: 'bg-rose-500 text-white border-transparent',
}

const STATUS_TABS: Array<{ value: TaskStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
]

const PAGE_SIZE = 20

const INPUT_CLASS = [
  'w-full rounded-xl border border-slate-200 dark:border-slate-700',
  'bg-white dark:bg-slate-800 px-4 py-3 text-sm',
  'text-slate-900 dark:text-slate-50',
  'placeholder:text-slate-400 dark:placeholder:text-slate-500',
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
  'transition-colors',
].join(' ')

const LABEL_CLASS = 'block text-sm font-semibold text-slate-700 dark:text-slate-300'

const EMPTY_FORM: TaskFormValues = { title: '', subject: '', dueDate: '', priority: 'low' }

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }

function PlusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
    </svg>
  )
}

function upsertTask(tasks: Task[], next: Task): Task[] {
  const idx = tasks.findIndex(({ id }) => id === next.id)
  return idx === -1 ? [next, ...tasks] : tasks.map((t) => (t.id === next.id ? next : t))
}

function matchesStatusFilter(task: Task, statusFilter: TaskStatus | 'all') {
  return statusFilter === 'all' || task.status === statusFilter
}

function AddTaskPage() {
  const [formValues, setFormValues] = useState<TaskFormValues>(EMPTY_FORM)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('pending')
  const [limit, setLimit] = useState(PAGE_SIZE)

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search)
      setLimit(PAGE_SIZE)
    }, 300)
    return () => clearTimeout(id)
  }, [search])

  useEffect(() => {
    setIsLoading(true)
    listTasks({ search: debouncedSearch || undefined, status: statusFilter, limit })
      .then(setTasks)
      .catch(() => setErrorMessage('Unable to load tasks right now.'))
      .finally(() => setIsLoading(false))
  }, [debouncedSearch, statusFilter, limit])

  function handleFieldChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target
    setFormValues((v) => ({ ...v, [name]: value }) as TaskFormValues)
  }

  function resetForm() {
    setFormValues(EMPTY_FORM)
    setEditingTaskId(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    setFeedbackMessage('')
    try {
      const saved = editingTaskId
        ? await updateTask(editingTaskId, formValues)
        : await createTask(formValues)
      setTasks((currentTasks) => {
        if (!matchesStatusFilter(saved, statusFilter)) {
          return currentTasks.filter((task) => task.id !== saved.id)
        }

        return upsertTask(currentTasks, saved)
      })
      setFeedbackMessage(editingTaskId ? 'Task updated.' : 'Task created.')
      resetForm()
    } catch {
      setErrorMessage('Unable to save this task right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function startEditing(task: Task) {
    setFormValues({
      title: task.title,
      subject: task.subject ?? '',
      dueDate: task.dueDate ?? '',
      priority: task.priority ?? 'low',
    })
    setEditingTaskId(task.id)
    setFeedbackMessage('')
    setErrorMessage('')
  }

  async function handleToggleComplete(task: Task) {
    setErrorMessage('')
    setFeedbackMessage('')
    try {
      const updated = await toggleTaskCompletion(task.id, task.status !== 'completed')
      setTasks((currentTasks) => {
        if (!matchesStatusFilter(updated, statusFilter)) {
          return currentTasks.filter((currentTask) => currentTask.id !== updated.id)
        }

        return upsertTask(currentTasks, updated)
      })
    } catch {
      setErrorMessage('Unable to update task status right now.')
    }
  }

  async function handleDelete(taskId: string) {
    if (!window.confirm('Delete this task?')) return
    setErrorMessage('')
    setFeedbackMessage('')
    try {
      await removeTask(taskId)
      setTasks((t) => t.filter((task) => task.id !== taskId))
      if (editingTaskId === taskId) resetForm()
    } catch {
      setErrorMessage('Unable to delete this task right now.')
    }
  }

  function handleStatusFilter(value: TaskStatus | 'all') {
    setStatusFilter(value)
    setLimit(PAGE_SIZE)
  }

  const canLoadMore = !isLoading && tasks.length === limit

  return (
    <section>
      <PageHeader title="Tasks" subtitle="Create, update, complete, and delete study tasks." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* Task list panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="m-0 text-lg font-semibold text-slate-900 dark:text-slate-50">
              Task collection
            </h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {tasks.length} task{tasks.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks…"
              className={`${INPUT_CLASS} pl-9`}
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-1.5 mb-5 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            {STATUS_TABS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleStatusFilter(value)}
                className={[
                  'flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors',
                  statusFilter === value
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-3" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 grid place-items-center text-slate-400 mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                {search ? 'No tasks match your search.' : 'No tasks yet'}
              </p>
              {!search ? (
                <p className="text-xs text-slate-400 dark:text-slate-500">Use the form to create your first task.</p>
              ) : null}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={(t) => void handleToggleComplete(t)}
                    onEdit={startEditing}
                    onDelete={(id) => void handleDelete(id)}
                  />
                ))}
              </div>
              {canLoadMore ? (
                <button
                  type="button"
                  onClick={() => setLimit((l) => l + PAGE_SIZE)}
                  className="mt-4 w-full rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Load more
                </button>
              ) : null}
            </>
          )}
        </div>

        {/* Form panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 lg:self-start">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-50">
                {editingTaskId ? <PencilIcon /> : <PlusIcon />}
                <h3 className="m-0 text-lg font-semibold">
                  {editingTaskId ? 'Edit task' : 'New task'}
                </h3>
              </div>
              {editingTaskId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>

            {feedbackMessage ? (
              <p className="m-0 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                {feedbackMessage}
              </p>
            ) : null}

            {errorMessage ? (
              <p className="m-0 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                {errorMessage}
              </p>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className={LABEL_CLASS}>Task Title</label>
              <input
                id="title" name="title" type="text"
                value={formValues.title} onChange={handleFieldChange}
                placeholder="Enter task title"
                className={INPUT_CLASS} required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="subject" className={LABEL_CLASS}>Subject</label>
              <input
                id="subject" name="subject" type="text"
                value={formValues.subject} onChange={handleFieldChange}
                placeholder="e.g. Math, History"
                className={INPUT_CLASS}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="dueDate" className={LABEL_CLASS}>Due Date</label>
              <input
                id="dueDate" name="dueDate" type="date"
                value={formValues.dueDate} onChange={handleFieldChange}
                className={INPUT_CLASS}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className={LABEL_CLASS} id="priority-label">Priority</span>
              <div className="flex gap-2" role="group" aria-labelledby="priority-label">
                {PRIORITIES.map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setFormValues((v) => ({ ...v, priority }))}
                    aria-pressed={formValues.priority === priority}
                    className={[
                      'flex-1 py-3 text-sm font-medium rounded-xl border transition-colors',
                      formValues.priority === priority
                        ? PRIORITY_PILL_SELECTED[priority]
                        : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800',
                    ].join(' ')}
                  >
                    {capitalize(priority)}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Saving…' : editingTaskId ? 'Update Task' : 'Save Task'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default AddTaskPage
