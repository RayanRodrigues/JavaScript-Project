import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import ProgressMeter from '../../components/ProgressMeter'
import { fetchProgressOverview } from './progress.client'
import type { ProgressOverviewResponse } from './progress.client'

function ProgressPage() {
  const [data, setData] = useState<ProgressOverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProgressOverview()
      .then(setData)
      .catch(() => setError('Unable to load progress data. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const completionRate = data?.summary.completionRate ?? 0
  const maxTotalTasks = data
    ? Math.max(...data.subjects.map((s) => s.totalTasks), 1)
    : 1

  return (
    <section>
      <PageHeader
        title="Progress"
        subtitle="Track your completed tasks and monitor how you're doing."
      />

      {error ? (
        <p className="mb-6 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-[2fr_1fr] gap-5 max-sm:grid-cols-1">

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mt-0 mb-4">
            Completion Overview
          </h3>
          {loading ? (
            <div className="space-y-3">
              <div className="h-12 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            </div>
          ) : (
            <>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-5xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">
                  {completionRate}%
                </span>
              </div>
              <ProgressMeter
                label="Tasks Completed"
                percentage={completionRate}
                tone="success"
                valueText={`${data?.summary.completedTasks ?? 0} of ${data?.summary.totalTasks ?? 0} tasks completed`}
              />
            </>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mt-0 mb-4">
            Subject Breakdown
          </h3>
          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : data && data.subjects.length > 0 ? (
            <div className="flex flex-col gap-4">
              {data.subjects.map(({ subject, totalTasks }) => (
                <div key={subject} className="flex items-center gap-3">
                  <span className="w-16 text-sm text-slate-600 dark:text-slate-300 shrink-0 truncate">
                    {subject}
                  </span>
                  <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all duration-500"
                      style={{ width: `${(totalTasks / maxTotalTasks) * 100}%` }}
                    />
                  </div>
                  <span className="w-14 text-right text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
                    {totalTasks} tasks
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No subject data yet.</p>
          )}
        </div>

      </div>
    </section>
  )
}

export default ProgressPage
