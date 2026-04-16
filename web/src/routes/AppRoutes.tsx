import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoginPage from '../features/auth/LoginPage'
import CreateAccountPage from '../features/auth/CreateAccountPage'
import AppShell from '../app/AppShell'
import AddTaskPage from '../features/tasks/AddTaskPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import ProgressPage from '../features/progress/ProgressPage'
import SchedulePage from '../features/schedule/SchedulePage'

function AuthenticatedApp() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tasks" element={<AddTaskPage />} />
        <Route path="/add-task" element={<Navigate to="/tasks" replace />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/progress" element={<ProgressPage />} />
      </Routes>
    </AppShell>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<CreateAccountPage />} />
      <Route path="/*" element={<AuthenticatedApp />} />
    </Routes>
  )
}
