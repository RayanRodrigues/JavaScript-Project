import { useEffect, useState } from 'react'
import AlertBanner from '../../components/AlertBanner'
import PageHeader from '../../components/PageHeader'
import { fetchScheduleSummary } from './schedule.client'
import type { ScheduleSummaryResponse, ScheduleTask } from './schedule.client'

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const PRIORITY_BADGE: Record<string, string> = {
  low: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300',
  medium: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
  high: 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300',
}

type StatKey = 'scheduledTasks' | 'overdueTasks' | 'completedTasks'

const STAT_CONFIG: Array<{
  key: StatKey
  label: string
  cardClass: string
  valueClass: string
  labelClass: string
}> = [
  {
    key: 'scheduledTasks',
    label: 'Scheduled',
    cardClass: 'bg-indigo-50 dark:bg-indigo-950/50 border-l-4 border-indigo-500',
    valueClass: 'text-indigo-700 dark:text-indigo-300',
    labelClass: 'text-indigo-500 dark:text-indigo-400',
  },
  {
    key: 'overdueTasks',
    label: 'Overdue',
    cardClass: 'bg-rose-50 dark:bg-rose-950/50 border-l-4 border-rose-500',
    valueClass: 'text-rose-700 dark:text-rose-300',
    labelClass: 'text-rose-500 dark:text-rose-400',
  },
  {
    key: 'completedTasks',
    label: 'Completed',
    cardClass: 'bg-emerald-50 dark:bg-emerald-950/50 border-l-4 border-emerald-500',
    valueClass: 'text-emerald-700 dark:text-emerald-300',
    labelClass: 'text-emerald-500 dark:text-emerald-400',
  },
]

interface TaskRowProps {
  task: ScheduleTask
  accent: string
}

function TaskRow({ task, accent }: TaskRowProps) {
  return (
    <div
      className={`flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-5 py-4 border-l-4 ${accent}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="shrink-0 text-xs font-semibold font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-200">
          {formatDate(task.dueDate)}
        </span>
        <div className="min-w-0">
          <p className="m-0 text-sm font-medium text-slate-900 dark:text-slate-50 truncate">
            {task.title}
          </p>
          {task.subject ? (
            <p className="m-0 text-xs text-slate-500 dark:text-slate-400">{task.subject}</p>
          ) : null}
        </div>
      </div>

      {task.priority ? (
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${PRIORITY_BADGE[task.priority]}`}>
          {capitalize(task.priority)}
        </span>
      ) : null}
    </div>
  )
}

function TaskSection({
  title,
  tasks,
  accent,
  emptyText,
  loading,
}: {
  title: string
  tasks: ScheduleTask[]
  accent: string
  emptyText: string
  loading: boolean
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mt-0 mb-4">
        {title}
      </h3>
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} accent={accent} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">{emptyText}</p>
      )}
    </div>
  )
}

function SchedulePage() {
  const [data, setData] = useState<ScheduleSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchScheduleSummary()
      .then(setData)
      .catch(() => setError('Unable to load schedule. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section>
      <PageHeader
        title="Study Schedule"
        subtitle="View your pending and overdue study tasks."
      />

      {error ? <AlertBanner variant="error" message={error} /> : null}

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-5 mb-6 max-sm:grid-cols-1">
        {STAT_CONFIG.map(({ key, label, cardClass, valueClass, labelClass }) => (
          <div key={key} className={`rounded-2xl p-6 ${cardClass}`}>
            {loading ? (
              <div className="h-8 bg-white/50 dark:bg-slate-700/50 rounded animate-pulse" />
            ) : (
              <>
                <p className={`text-3xl font-extrabold leading-none m-0 ${valueClass}`}>
                  {data?.summary[key] ?? 0}
                </p>
                <p className={`text-xs font-semibold uppercase tracking-wide mt-1 mb-0 ${labelClass}`}>
                  {label}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Task sections */}
      <div className="grid grid-cols-[3fr_2fr] gap-5 max-sm:grid-cols-1">
        <TaskSection
          title="Upcoming"
          tasks={data?.upcoming ?? []}
          accent="border-indigo-500"
          emptyText="No upcoming tasks."
          loading={loading}
        />
        <TaskSection
          title="Overdue"
          tasks={data?.overdue ?? []}
          accent="border-rose-500"
          emptyText="No overdue tasks."
          loading={loading}
        />
      </div>
    </section>
  )
}

export default SchedulePage
