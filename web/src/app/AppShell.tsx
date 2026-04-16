import Navbar from '../components/Navbar'
import { AppRoutes } from '../routes/AppRoutes'
import './app-shell.css'

function AppShell() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-shell__main">
        <AppRoutes />
      </main>
    </div>
  )
}

export default AppShell
