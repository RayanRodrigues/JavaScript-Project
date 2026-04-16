import PageHeader from '../../components/PageHeader'
import '../../styles/page.css'
import './schedule.css'

function SchedulePage() {
  return (
    <section className="page">
      <PageHeader
        title="Study Schedule"
        subtitle="View your study plan and keep track of upcoming sessions."
      />

      <div className="card">
        <h3>This Week</h3>
        <div className="schedule-list">
          <div className="schedule-item">
            <div>
              <h4>Monday</h4>
              <p>Math practice and note review</p>
            </div>
            <span>6:00 PM</span>
          </div>

          <div className="schedule-item">
            <div>
              <h4>Wednesday</h4>
              <p>History reading and outline prep</p>
            </div>
            <span>5:30 PM</span>
          </div>

          <div className="schedule-item">
            <div>
              <h4>Friday</h4>
              <p>Biology flashcards and quiz review</p>
            </div>
            <span>4:00 PM</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SchedulePage
