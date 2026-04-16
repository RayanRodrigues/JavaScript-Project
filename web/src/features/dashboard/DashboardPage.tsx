import PageHeader from '../../components/PageHeader'
import ProgressMeter from '../../components/ProgressMeter'
import SummaryList from '../../components/SummaryList'

const UPCOMING_DEADLINES = [
  { label: 'Math Quiz Review', value: 'Apr 18' },
  { label: 'History Essay Outline', value: 'Apr 19' },
  { label: 'Biology Flashcards', value: 'Apr 20' },
]

const STAT_CARDS = [
  {
    value: '12',
    label: 'Total Tasks',
    cardClass: 'bg-indigo-50 dark:bg-indigo-950/50 border-l-4 border-indigo-500',
    valueClass: 'text-indigo-700 dark:text-indigo-300',
    labelClass: 'text-indigo-500 dark:text-indigo-400',
    icon: <BookIcon />,
    iconClass: 'text-indigo-500 dark:text-indigo-400',
  },
  {
    value: '7',
    label: 'Completed',
    cardClass: 'bg-emerald-50 dark:bg-emerald-950/50 border-l-4 border-emerald-500',
    valueClass: 'text-emerald-700 dark:text-emerald-300',
    labelClass: 'text-emerald-500 dark:text-emerald-400',
    icon: <CheckIcon />,
    iconClass: 'text-emerald-500 dark:text-emerald-400',
  },
  {
    value: '5',
    label: 'Pending',
    cardClass: 'bg-amber-50 dark:bg-amber-950/50 border-l-4 border-amber-500',
    valueClass: 'text-amber-700 dark:text-amber-300',
    labelClass: 'text-amber-500 dark:text-amber-400',
    icon: <ClockIcon />,
    iconClass: 'text-amber-500 dark:text-amber-400',
  },
]

function DashboardPage() {
  return (
    <section>
      <PageHeader
        title="Dashboard"
        subtitle="Get a quick overview of your study tasks and upcoming deadlines."
      />

      <div className="grid grid-cols-3 gap-5 mb-6 max-sm:grid-cols-1">
        {STAT_CARDS.map(({ value, label, cardClass, valueClass, labelClass, icon, iconClass }) => (
          <div key={label} className={`rounded-2xl p-6 flex items-center gap-4 ${cardClass}`}>
            <div className={`shrink-0 ${iconClass}`}>{icon}</div>
            <div>
              <p className={`text-3xl font-extrabold leading-none m-0 ${valueClass}`}>{value}</p>
              <p className={`text-xs font-semibold uppercase tracking-wide mt-1 mb-0 ${labelClass}`}>
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-5 max-sm:grid-cols-1">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mt-0 mb-1">
            Upcoming Deadlines
          </h3>
          <SummaryList items={UPCOMING_DEADLINES} />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mt-0 mb-1">
            Study Focus
          </h3>
          <ProgressMeter label="Weekly Goal" percentage={68} valueText="68% completed" />
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

export default DashboardPage
