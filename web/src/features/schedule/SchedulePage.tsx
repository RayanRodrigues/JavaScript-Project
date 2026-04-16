import PageHeader from '../../components/PageHeader'

interface ScheduleItem {
  day: string
  description: string
  time: string
  accentClass: string
  badgeClass: string
}

const SCHEDULE_ITEMS: ScheduleItem[] = [
  {
    day: 'Monday',
    description: 'Math practice and note review',
    time: '6:00 PM',
    accentClass: 'border-indigo-500',
    badgeClass: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300',
  },
  {
    day: 'Wednesday',
    description: 'History reading and outline prep',
    time: '5:30 PM',
    accentClass: 'border-violet-500',
    badgeClass: 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300',
  },
  {
    day: 'Friday',
    description: 'Biology flashcards and quiz review',
    time: '4:00 PM',
    accentClass: 'border-teal-500',
    badgeClass: 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300',
  },
]

function SchedulePage() {
  return (
    <section>
      <PageHeader
        title="Study Schedule"
        subtitle="View your study plan and keep track of upcoming sessions."
      />

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mt-0 mb-4">
          This Week
        </h3>

        <div className="flex flex-col gap-3">
          {SCHEDULE_ITEMS.map(({ day, description, time, accentClass, badgeClass }) => (
            <div
              key={day}
              className={`flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-5 py-4 border-l-4 ${accentClass}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
                  {day}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
                  {description}
                </span>
              </div>

              <span className="shrink-0 text-sm font-semibold font-mono text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1 rounded-lg">
                {time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SchedulePage
