import { listTasksForUser } from '../tasks/tasks.service.js';
import { scheduleSummaryResponseSchema } from './schedule.schema.js';

function isOverdue(dueDate: string, today: string) {
  return dueDate < today;
}

export async function getScheduleSummary(userId: string, today = new Date().toISOString().slice(0, 10)) {
  const { tasks } = await listTasksForUser(userId);

  const scheduledTasks = tasks
    .filter((task) => task.dueDate)
    .sort((left, right) => left.dueDate!.localeCompare(right.dueDate!))
    .map((task) => ({
      id: task.id,
      title: task.title,
      subject: task.subject,
      dueDate: task.dueDate!,
      priority: task.priority,
      status: task.status,
    }));

  const overdue = scheduledTasks.filter(
    (task) => task.status === 'pending' && isOverdue(task.dueDate, today),
  );
  const upcoming = scheduledTasks.filter(
    (task) => task.status === 'pending' && !isOverdue(task.dueDate, today),
  );
  const completedTasks = scheduledTasks.filter((task) => task.status === 'completed').length;

  return scheduleSummaryResponseSchema.parse({
    summary: {
      scheduledTasks: scheduledTasks.length,
      overdueTasks: overdue.length,
      completedTasks,
    },
    upcoming,
    overdue,
  });
}
