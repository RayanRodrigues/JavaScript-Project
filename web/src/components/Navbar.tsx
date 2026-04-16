import { NavLink } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/progress', label: 'Progress' },
]

function Navbar() {
  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white grid place-items-center font-extrabold text-sm shrink-0">
            SP
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-slate-50 leading-tight m-0">
              Study Planner
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight m-0">
              Organize your work and stay on track
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
                  ].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-2 pl-2 border-l border-slate-200 dark:border-slate-700">
            <ThemeToggle />
          </div>
        </div>

      </div>
    </header>
  )
}

export default Navbar
