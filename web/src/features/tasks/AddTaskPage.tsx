import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import PageHeader from '../../components/PageHeader'
import {
  createTask,
  listTasks,
  removeTask,
  toggleTaskCompletion,
  updateTask,
} from './task.service'
import type { Task, TaskFormValues, TaskPriority } from './task.types'

const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High']

const INPUT_CLASS = [
  'w-full rounded-xl border border-slate-200 dark:border-slate-700',
  'bg-white dark:bg-slate-800 px-4 py-3 text-sm',
  'text-slate-900 dark:text-slate-50',
  'placeholder:text-slate-400 dark:placeholder:text-slate-500',
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
  'transition-colors',
].join(' ')

const LABEL_CLASS = 'block text-sm font-semibold text-slate-700 dark:text-slate-300'

const EMPTY_FORM: TaskFormValues = {
  title: '',
  subject: '',
  dueDate: '',
  notes: '',
  priority: 'Low',
}

function upsertTask(tasks: Task[], nextTask: Task) {
  const existingTaskIndex = tasks.findIndex(({ id }) => id === nextTask.id)

  if (existingTaskIndex === -1) {
    return [nextTask, ...tasks]
  }

  return tasks.map((task) => (task.id === nextTask.id ? nextTask : task))
}

function AddTaskPage() {
  const [formValues, setFormValues] = useState<TaskFormValues>(EMPTY_FORM)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadTasks() {
      try {
        const nextTasks = await listTasks()
        setTasks(nextTasks)
      } catch {
        setErrorMessage('Unable to load tasks right now.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadTasks()
  }, [])

  function handleFieldChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target
    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }) as TaskFormValues)
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
      const savedTask = editingTaskId
        ? await updateTask(editingTaskId, formValues)
        : await createTask(formValues)

      setTasks((currentTasks) => upsertTask(currentTasks, savedTask))
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
      subject: task.subject,
      dueDate: task.dueDate,
      notes: task.notes,
      priority: task.priority,
    })
    setEditingTaskId(task.id)
    setFeedbackMessage('')
    setErrorMessage('')
  }

  async function handleToggleComplete(task: Task) {
    setErrorMessage('')
    setFeedbackMessage('')

    try {
      const updatedTask = await toggleTaskCompletion(task.id, !task.completed)
      setTasks((currentTasks) => upsertTask(currentTasks, updatedTask))
    } catch {
      setErrorMessage('Unable to update task status right now.')
    }
  }

  async function handleDelete(taskId: string) {
    if (!window.confirm('Delete this task?')) {
      return
    }

    setErrorMessage('')
    setFeedbackMessage('')

    try {
      await removeTask(taskId)
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))

      if (editingTaskId === taskId) {
        resetForm()
      }
    } catch {
      setErrorMessage('Unable to delete this task right now.')
    }
  }

  return (
    <section>
      <PageHeader
        title="Tasks"
        subtitle="Create, update, complete, and delete study tasks with Firebase."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="m-0 text-lg font-semibold text-slate-900 dark:text-slate-50">
                {editingTaskId ? 'Edit task' : 'New task'}
              </h3>
              {editingTaskId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
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
                id="title"
                name="title"
                type="text"
                value={formValues.title}
                onChange={handleFieldChange}
                placeholder="Enter task title"
                className={INPUT_CLASS}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="subject" className={LABEL_CLASS}>Subject</label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={formValues.subject}
                onChange={handleFieldChange}
                placeholder="Enter subject"
                className={INPUT_CLASS}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="dueDate" className={LABEL_CLASS}>Due Date</label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formValues.dueDate}
                  onChange={handleFieldChange}
                  className={INPUT_CLASS}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className={LABEL_CLASS} id="priority-label">Priority</span>
                <div className="flex gap-2" role="group" aria-labelledby="priority-label">
                  {PRIORITIES.map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() =>
                        setFormValues((currentValues) => ({ ...currentValues, priority }))
                      }
                      aria-pressed={formValues.priority === priority}
                      className={[
                        'flex-1 py-3 text-sm font-medium rounded-xl transition-colors',
                        formValues.priority === priority
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800',
                      ].join(' ')}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="notes" className={LABEL_CLASS}>Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows={5}
                value={formValues.notes}
                onChange={handleFieldChange}
                placeholder="Add any study notes or reminders"
                className={INPUT_CLASS}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl py-3 font-semibold transition-colors mt-2 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : editingTaskId ? 'Update Task' : 'Save Task'}
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h3 className="m-0 text-lg font-semibold text-slate-900 dark:text-slate-50">
              Task collection
            </h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {tasks.length} task{tasks.length === 1 ? '' : 's'}
            </span>
          </div>

          {isLoading ? (
            <p className="m-0 text-sm text-slate-500 dark:text-slate-400">Loading tasks...</p>
          ) : null}

          {!isLoading && tasks.length === 0 ? (
            <p className="m-0 text-sm text-slate-500 dark:text-slate-400">
              No tasks in Firestore yet. Create the first one from the form.
            </p>
          ) : null}

          <div className="space-y-4">
            {tasks.map((task) => (
              <article
                key={task.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-950/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={[
                          'm-0 text-base font-semibold text-slate-900 dark:text-slate-50',
                          task.completed ? 'line-through opacity-70' : '',
                        ].join(' ')}
                      >
                        {task.title}
                      </h4>
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                        {task.priority}
                      </span>
                    </div>
                    <p className="mb-0 mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {task.subject} • Due {task.dueDate}
                    </p>
                    {task.notes ? (
                      <p className="mb-0 mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {task.notes}
                      </p>
                    ) : null}
                  </div>

                  <span
                    className={[
                      'rounded-full px-2.5 py-1 text-xs font-semibold',
                      task.completed
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
                    ].join(' ')}
                  >
                    {task.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void handleToggleComplete(task)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {task.completed ? 'Mark incomplete' : 'Mark complete'}
                  </button>

                  <button
                    type="button"
                    onClick={() => startEditing(task)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(task.id)}
                    className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/50"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AddTaskPage
