import PageHeader from '../../components/PageHeader'
import ProgressMeter from '../../components/ProgressMeter'
import SummaryList from '../../components/SummaryList'
import '../../styles/page.css'
import './progress.css'

const subjectBreakdown = [
  { label: 'Math', value: '4 tasks' },
  { label: 'History', value: '3 tasks' },
  { label: 'Biology', value: '5 tasks' },
]

function ProgressPage() {
  return (
    <section className="page">
      <PageHeader
        title="Progress"
        subtitle="Track your completed tasks and monitor how you're doing."
      />

      <div className="content-grid">
        <div className="card">
          <h3>Completion Overview</h3>
          <ProgressMeter
            label="Tasks Completed"
            percentage={58}
            tone="success"
            valueText="58% of all tasks completed"
          />
        </div>

        <div className="card">
          <h3>Subject Breakdown</h3>
          <SummaryList items={subjectBreakdown} />
        </div>
      </div>
    </section>
  )
}

export default ProgressPage
