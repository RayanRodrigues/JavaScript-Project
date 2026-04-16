import { NavLink } from 'react-router-dom'
import './Navbar.css'


// Reusable navigation component.
// Helps organize the application into components and allows navigation between pages.
function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="brand-badge">SP</div>
        <div>
          <h1>Study Planner</h1>
          <p>Organize your work and stay on track</p>
        </div>
      </div>

      <nav className="nav-links">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Dashboard
        </NavLink>
        <NavLink to="/add-task" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Add Task
        </NavLink>
        <NavLink to="/schedule" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Schedule
        </NavLink>
        <NavLink to="/progress" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Progress
        </NavLink>
      </nav>
    </header>
  )
}

export default Navbar