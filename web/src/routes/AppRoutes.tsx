import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoginPage from '../features/auth/LoginPage'
import CreateAccountPage from '../features/auth/CreateAccountPage'
import AppShell from '../app/AppShell'
import AddTaskPage from '../features/tasks/AddTaskPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import ProfilePage from '../features/auth/ProfilePage'
import ProgressPage from '../features/progress/ProgressPage'
import SchedulePage from '../features/schedule/SchedulePage'
import NotFoundPage from '../features/not-found/NotFoundPage'

function ProtectedLayout() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<CreateAccountPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tasks" element={<AddTaskPage />} />
        <Route path="/add-task" element={<Navigate to="/tasks" replace />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
