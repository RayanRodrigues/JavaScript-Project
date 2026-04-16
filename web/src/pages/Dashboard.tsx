import PageHeader from '../components/PageHeader'
import './Pages.css'

// Dashboard page component.
// Displays study overview information in a clean and professional layout.

function Dashboard() {
  return (
    <section className="page">
      <PageHeader
        title="Dashboard"
        subtitle="Get a quick overview of your study tasks and upcoming deadlines."
      />

      <div className="stats-grid">
        <div className="card stat-card blue">
          <h3>12</h3>
          <p>Total Tasks</p>
        </div>
        <div className="card stat-card green">
          <h3>7</h3>
          <p>Completed</p>
        </div>
        <div className="card stat-card yellow">
          <h3>5</h3>
          <p>Pending</p>
        </div>
      </div>

      <div className="content-grid">
        <div className="card">
          <h3>Upcoming Deadlines</h3>
          <ul className="item-list">
            <li>
              <span>Math Quiz Review</span>
              <strong>Apr 18</strong>
            </li>
            <li>
              <span>History Essay Outline</span>
              <strong>Apr 19</strong>
            </li>
            <li>
              <span>Biology Flashcards</span>
              <strong>Apr 20</strong>
            </li>
          </ul>
        </div>

        <div className="card">
          <h3>Study Focus</h3>
          <div className="progress-block">
            <p>Weekly Goal</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '68%' }}></div>
            </div>
            <span>68% completed</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Dashboard