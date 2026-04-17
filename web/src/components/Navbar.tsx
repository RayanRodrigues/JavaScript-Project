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

function HamburgerIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!userMenuOpen) return
    function onOutsideClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [userMenuOpen])

  useEffect(() => {
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setUserMenuOpen(false)
        setMobileNavOpen(false)
      }
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [])

  async function handleLogout() {
    setUserMenuOpen(false)
    setMobileNavOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  const emailInitial = user?.email?.[0]?.toUpperCase() ?? null

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
      isActive
        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
    ].join(' ')

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'block px-4 py-3 text-sm font-medium rounded-xl transition-colors',
      isActive
        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800',
    ].join(' ')

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Main bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white grid place-items-center font-extrabold text-sm shrink-0">
            SP
          </div>
          <div className="hidden sm:block">
            <p className="text-base font-bold text-slate-900 dark:text-slate-50 leading-tight m-0">
              Study Planner
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight m-0">
              Organize your work and stay on track
            </p>
          </div>
          <p className="sm:hidden text-base font-bold text-slate-900 dark:text-slate-50 m-0">
            Study Planner
          </p>
        </div>

        {/* Desktop nav + actions */}
        <div className="flex items-center gap-1">
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:ml-3 md:pl-3 md:border-l md:border-slate-200 md:dark:border-slate-700">
            <ThemeToggle />

            {/* User dropdown (desktop) */}
            {emailInitial ? (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                  aria-label="Account menu"
                  className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 grid place-items-center text-xs font-bold shrink-0">
                    {emailInitial}
                  </div>
                  <ChevronDownIcon open={userMenuOpen} />
                </button>

                {userMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-20"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-400 dark:text-slate-500 m-0 mb-0.5">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 m-0 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
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

            {/* Hamburger (mobile) */}
            <button
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              {mobileNavOpen ? <XIcon /> : <HamburgerIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileNavOpen ? (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 pb-4 pt-2">
          <nav className="flex flex-col gap-1 mb-3">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={mobileNavLinkClass}
                onClick={() => setMobileNavOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {emailInitial ? (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1">
              <div className="px-4 py-2">
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Signed in as</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                  {user?.email}
                </p>
              </div>
              <Link
                to="/profile"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <UserIcon />
                View profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              >
                <LogOutIcon />
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  )
}

export default Navbar
