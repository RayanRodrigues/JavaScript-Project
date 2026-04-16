import PageHeader from '../../components/PageHeader'
import ProgressMeter from '../../components/ProgressMeter'

interface SubjectItem {
  label: string
  count: number
}

const SUBJECTS: SubjectItem[] = [
  { label: 'Math', count: 4 },
  { label: 'History', count: 3 },
  { label: 'Biology', count: 5 },
]

const COMPLETION_PCT = 58

function ProgressPage() {
  const maxCount = Math.max(...SUBJECTS.map((s) => s.count))

  return (
    <section>
      <PageHeader
        title="Progress"
        subtitle="Track your completed tasks and monitor how you're doing."
      />

      <div className="grid grid-cols-[2fr_1fr] gap-5 max-sm:grid-cols-1">

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mt-0 mb-4">
            Completion Overview
          </h3>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-5xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">
              {COMPLETION_PCT}%
            </span>
          </div>
          <ProgressMeter
            label="Tasks Completed"
            percentage={COMPLETION_PCT}
            tone="success"
            valueText="of all tasks completed"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mt-0 mb-4">
            Subject Breakdown
          </h3>
          <div className="flex flex-col gap-4">
            {SUBJECTS.map(({ label, count }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-16 text-sm text-slate-600 dark:text-slate-300 shrink-0">
                  {label}
                </span>
                <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-14 text-right text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
                  {count} tasks
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

export default ProgressPage
