import { Navigate, Route, Routes } from 'react-router-dom'
import AddTaskPage from '../features/tasks/AddTaskPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import ProgressPage from '../features/progress/ProgressPage'
import SchedulePage from '../features/schedule/SchedulePage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/add-task" element={<AddTaskPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/progress" element={<ProgressPage />} />
    </Routes>
  )
}
