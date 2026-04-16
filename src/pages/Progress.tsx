import PageHeader from '../components/PageHeader'
import './Pages.css'

// Progress page component.
// Displays completion progress and performance tracking in the interface.

function Progress() {
  return (
    <section className="page">
      <PageHeader
        title="Progress"
        subtitle="Track your completed tasks and monitor how you're doing."
      />

      <div className="content-grid">
        <div className="card">
          <h3>Completion Overview</h3>
          <div className="progress-block">
            <p>Tasks Completed</p>
            <div className="progress-bar">
              <div className="progress-fill green-fill" style={{ width: '58%' }}></div>
            </div>
            <span>58% of all tasks completed</span>
          </div>
        </div>

        <div className="card">
          <h3>Subject Breakdown</h3>
          <ul className="item-list">
            <li>
              <span>Math</span>
              <strong>4 tasks</strong>
            </li>
            <li>
              <span>History</span>
              <strong>3 tasks</strong>
            </li>
            <li>
              <span>Biology</span>
              <strong>5 tasks</strong>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Progress