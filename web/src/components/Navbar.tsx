import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { useAuth } from '../hooks/useAuth'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/progress', label: 'Progress' },
]

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function LogOutIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function onOutsideClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [menuOpen])

  useEffect(() => {
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [])

  function handleLogout() {
    setMenuOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  const emailInitial = user?.email?.[0]?.toUpperCase() ?? null

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
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

        {/* Right side */}
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

          <div className="ml-3 pl-3 border-l border-slate-200 dark:border-slate-700 flex items-center gap-1">
            <ThemeToggle />

            {/* User dropdown */}
            {emailInitial ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  aria-label="Account menu"
                  className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 grid place-items-center text-xs font-bold shrink-0">
                    {emailInitial}
                  </div>
                  <ChevronDownIcon open={menuOpen} />
                </button>

                {menuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-20"
                  >
                    {/* Email header */}
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-400 dark:text-slate-500 m-0 mb-0.5">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 m-0 truncate">
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <UserIcon />
                        View profile
                      </Link>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      <button
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      >
                        <LogOutIcon />
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

      </div>
    </header>
  )
}

export default Navbar
