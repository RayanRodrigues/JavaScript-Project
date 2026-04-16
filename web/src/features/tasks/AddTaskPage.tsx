import PageHeader from '../../components/PageHeader'
import '../../styles/page.css'
import './add-task.css'

function AddTaskPage() {
  return (
    <section className="page">
      <PageHeader
        title="Add Task"
        subtitle="Create a new study task and organize your workload."
      />

      <div className="card form-card">
        <form className="task-form">
          <div className="form-group">
            <label htmlFor="title">Task Title</label>
            <input id="title" type="text" placeholder="Enter task title" />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input id="subject" type="text" placeholder="Enter subject" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Due Date</label>
              <input id="date" type="date" />
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select id="priority">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              rows={5}
              placeholder="Add any study notes or reminders"
            />
          </div>

          <button type="submit" className="primary-btn">
            Save Task
          </button>
        </form>
      </div>
    </section>
  )
}

export default AddTaskPage
