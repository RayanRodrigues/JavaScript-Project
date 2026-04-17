import type { Task, TaskPriority } from './task.types'

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function UndoIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

const PRIORITY_STYLE: Record<TaskPriority, { accent: string; badge: string }> = {
  low: {
    accent: 'border-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  },
  medium: {
    accent: 'border-amber-500',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
  high: {
    accent: 'border-rose-500',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  },
}

const DEFAULT_STYLE = PRIORITY_STYLE.low

interface TaskCardProps {
  task: Task
  onToggleComplete: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const style = task.priority ? PRIORITY_STYLE[task.priority] : DEFAULT_STYLE
  const isCompleted = task.status === 'completed'

  return (
    <article
      className={[
        'rounded-2xl border border-slate-200 dark:border-slate-700 border-l-4 bg-white dark:bg-slate-900',
        style.accent,
      ].join(' ')}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h4
                className={[
                  'm-0 text-base font-semibold text-slate-900 dark:text-slate-50',
                  isCompleted ? 'line-through opacity-50' : '',
                ].join(' ')}
              >
                {task.title}
              </h4>
              {task.priority ? (
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}>
                  {capitalize(task.priority)}
                </span>
              ) : null}
            </div>
            <p className="m-0 text-sm text-slate-500 dark:text-slate-400">
              {task.subject ?? '—'}{task.dueDate ? ` · Due ${task.dueDate}` : ''}
            </p>
          </div>

          <span
            className={[
              'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
              isCompleted
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
            ].join(' ')}
          >
            {isCompleted ? 'Completed' : 'Pending'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onToggleComplete(task)}
            className={[
              'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors',
              isCompleted
                ? 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                : 'border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50',
            ].join(' ')}
          >
            {isCompleted ? <UndoIcon /> : <CheckIcon />}
            {isCompleted ? 'Mark incomplete' : 'Mark complete'}
          </button>

          <button
            type="button"
            onClick={() => onEdit(task)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <PencilIcon />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="inline-flex items-center gap-1.5 ml-auto rounded-xl border border-rose-200 dark:border-rose-900 px-3 py-1.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
          >
            <TrashIcon />
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}

export default TaskCard
