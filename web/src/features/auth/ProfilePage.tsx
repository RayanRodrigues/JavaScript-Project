import PageHeader from '../../components/PageHeader'
import { useAuth } from '../../hooks/useAuth'

function ProfilePage() {
  const { user } = useAuth()

  return (
    <section>
      <PageHeader title="Profile" subtitle="Your account details." />

      <div className="max-w-lg">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-8">
          {/* Avatar + name row */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 grid place-items-center text-2xl font-bold shrink-0">
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 m-0 truncate">
                {user?.email ?? '—'}
              </p>
              <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300 mt-1">
                Student
              </span>
            </div>
          </div>

          {/* Detail rows */}
          <dl className="divide-y divide-slate-100 dark:divide-slate-800">
            <div className="py-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">
                Email
              </dt>
              <dd className="text-sm text-slate-900 dark:text-slate-50">
                {user?.email ?? '—'}
              </dd>
            </div>

            <div className="py-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">
                User ID
              </dt>
              <dd className="text-sm font-mono text-slate-600 dark:text-slate-300 break-all">
                {user?.userId ?? '—'}
              </dd>
            </div>

            <div className="py-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">
                Role
              </dt>
              <dd className="text-sm text-slate-900 dark:text-slate-50">Student</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}

export default ProfilePage
