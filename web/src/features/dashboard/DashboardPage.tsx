import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import ProgressMeter from '../../components/ProgressMeter'
import SummaryList from '../../components/SummaryList'
import { fetchDashboardSummary } from './dashboard.client'
import type { DashboardSummary } from './dashboard.client'

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

type StatKey = 'totalTasks' | 'completedTasks' | 'pendingTasks' | 'highPriorityTasks'

const STAT_CONFIG: Array<{
  key: StatKey
  label: string
  cardClass: string
  valueClass: string
  labelClass: string
  iconClass: string
  Icon: () => React.ReactElement
}> = [
  {
    key: 'totalTasks',
    label: 'Total Tasks',
    cardClass: 'bg-indigo-50 dark:bg-indigo-950/50 border-l-4 border-indigo-500',
    valueClass: 'text-indigo-700 dark:text-indigo-300',
    labelClass: 'text-indigo-500 dark:text-indigo-400',
    iconClass: 'text-indigo-500 dark:text-indigo-400',
    Icon: BookIcon,
  },
  {
    key: 'completedTasks',
    label: 'Completed',
    cardClass: 'bg-emerald-50 dark:bg-emerald-950/50 border-l-4 border-emerald-500',
    valueClass: 'text-emerald-700 dark:text-emerald-300',
    labelClass: 'text-emerald-500 dark:text-emerald-400',
    iconClass: 'text-emerald-500 dark:text-emerald-400',
    Icon: CheckIcon,
  },
  {
    key: 'pendingTasks',
    label: 'Pending',
    cardClass: 'bg-amber-50 dark:bg-amber-950/50 border-l-4 border-amber-500',
    valueClass: 'text-amber-700 dark:text-amber-300',
    labelClass: 'text-amber-500 dark:text-amber-400',
    iconClass: 'text-amber-500 dark:text-amber-400',
    Icon: ClockIcon,
  },
  {
    key: 'highPriorityTasks',
    label: 'High Priority',
    cardClass: 'bg-rose-50 dark:bg-rose-950/50 border-l-4 border-rose-500',
    valueClass: 'text-rose-700 dark:text-rose-300',
    labelClass: 'text-rose-500 dark:text-rose-400',
    iconClass: 'text-rose-500 dark:text-rose-400',
    Icon: AlertIcon,
  },
]

function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardSummary()
      .then(setData)
      .catch(() => setError('Unable to load dashboard data. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const completionPct =
    data && data.summary.totalTasks > 0
      ? Math.round((data.summary.completedTasks / data.summary.totalTasks) * 100)
      : 0

  const deadlineItems =
    data?.upcomingDeadlines.map((d) => ({
      label: d.title,
      value: formatDate(d.dueDate),
    })) ?? []

  return (
    <section>
      <PageHeader
        title="Dashboard"
        subtitle="Get a quick overview of your study tasks and upcoming deadlines."
      />

      {error ? (
        <p className="mb-6 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-4 gap-5 mb-6 max-sm:grid-cols-1 max-md:grid-cols-2">
          {STAT_CONFIG.map(({ key }) => (
            <div key={key} className="rounded-2xl bg-slate-100 dark:bg-slate-800 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-5 mb-6 max-sm:grid-cols-1 max-md:grid-cols-2">
          {STAT_CONFIG.map(({ key, label, cardClass, valueClass, labelClass, iconClass, Icon }) => (
            <div key={label} className={`rounded-2xl p-6 flex items-center gap-4 ${cardClass}`}>
              <div className={`shrink-0 ${iconClass}`}><Icon /></div>
              <div>
                <p className={`text-3xl font-extrabold leading-none m-0 ${valueClass}`}>
                  {data?.summary[key] ?? 0}
                </p>
                <p className={`text-xs font-semibold uppercase tracking-wide mt-1 mb-0 ${labelClass}`}>
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content panels */}
      <div className="grid grid-cols-[2fr_1fr] gap-5 max-sm:grid-cols-1">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mt-0 mb-1">
            Upcoming Deadlines
          </h3>
          {loading ? (
            <div className="space-y-3 mt-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : deadlineItems.length > 0 ? (
            <SummaryList items={deadlineItems} />
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">No upcoming deadlines.</p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mt-0 mb-1">
            Completion Rate
          </h3>
          {loading ? (
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mt-3" />
          ) : (
            <ProgressMeter
              label="Tasks completed"
              percentage={completionPct}
              valueText={`${completionPct}% completed`}
            />
          )}
        </div>
      </div>
    </section>
  )
}

function BookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

export default DashboardPage
