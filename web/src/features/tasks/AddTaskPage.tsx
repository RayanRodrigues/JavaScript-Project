import { useState } from 'react'
import PageHeader from '../../components/PageHeader'

type Priority = 'Low' | 'Medium' | 'High'

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High']

const INPUT_CLASS = [
  'w-full rounded-xl border border-slate-200 dark:border-slate-700',
  'bg-white dark:bg-slate-800 px-4 py-3 text-sm',
  'text-slate-900 dark:text-slate-50',
  'placeholder:text-slate-400 dark:placeholder:text-slate-500',
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
  'transition-colors',
].join(' ')

const LABEL_CLASS = 'block text-sm font-semibold text-slate-700 dark:text-slate-300'

function AddTaskPage() {
  const [priority, setPriority] = useState<Priority>('Low')

  return (
    <section>
      <PageHeader
        title="Add Task"
        subtitle="Create a new study task and organize your workload."
      />

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 max-w-2xl">
        <form className="flex flex-col gap-5">

          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className={LABEL_CLASS}>Task Title</label>
            <input
              id="title"
              type="text"
              placeholder="Enter task title"
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="subject" className={LABEL_CLASS}>Subject</label>
            <input
              id="subject"
              type="text"
              placeholder="Enter subject"
              className={INPUT_CLASS}
            />
          </div>

          <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="date" className={LABEL_CLASS}>Due Date</label>
              <input id="date" type="date" className={INPUT_CLASS} />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className={LABEL_CLASS} id="priority-label">Priority</span>
              <div className="flex gap-2" role="group" aria-labelledby="priority-label">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    aria-pressed={priority === p}
                    className={[
                      'flex-1 py-3 text-sm font-medium rounded-xl transition-colors',
                      priority === p
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800',
                    ].join(' ')}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="notes" className={LABEL_CLASS}>Notes</label>
            <textarea
              id="notes"
              rows={5}
              placeholder="Add any study notes or reminders"
              className={INPUT_CLASS}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl py-3 font-semibold transition-colors mt-2 cursor-pointer"
          >
            Save Task
          </button>

        </form>
      </div>
    </section>
  )
}

export default AddTaskPage
