import Navbar from '../components/Navbar'

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}

export default AppShell
