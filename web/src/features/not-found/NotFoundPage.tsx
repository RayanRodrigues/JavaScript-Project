import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-8xl font-extrabold text-indigo-600 dark:text-indigo-400 leading-none mb-4">
        404
      </p>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
        Page not found
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 text-sm font-semibold transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}

export default NotFoundPage
