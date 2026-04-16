import PageHeader from '../../components/PageHeader'
import ProgressMeter from '../../components/ProgressMeter'
import SummaryList from '../../components/SummaryList'
import '../../styles/page.css'
import './dashboard.css'

const upcomingDeadlines = [
  { label: 'Math Quiz Review', value: 'Apr 18' },
  { label: 'History Essay Outline', value: 'Apr 19' },
  { label: 'Biology Flashcards', value: 'Apr 20' },
]

function DashboardPage() {
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
          <SummaryList items={upcomingDeadlines} />
        </div>

        <div className="card">
          <h3>Study Focus</h3>
          <ProgressMeter label="Weekly Goal" percentage={68} valueText="68% completed" />
        </div>
      </div>
    </section>
  )
}

export default DashboardPage
