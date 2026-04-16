import { listTasksForUser } from '../tasks/tasks.service.js';
import { dashboardSummaryResponseSchema } from './dashboard.schema.js';

export async function getDashboardSummary(userId: string) {
  const { tasks } = await listTasksForUser(userId);

  const completedTasks = tasks.filter((task) => task.status === 'completed').length;
  const pendingTasks = tasks.filter((task) => task.status === 'pending').length;
  const highPriorityTasks = tasks.filter(
    (task) => task.status === 'pending' && task.priority === 'high',
  ).length;

  const upcomingDeadlines = tasks
    .filter((task) => task.status === 'pending' && task.dueDate)
    .sort((left, right) => left.dueDate!.localeCompare(right.dueDate!))
    .slice(0, 5)
    .map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate!,
      priority: task.priority,
      status: task.status,
    }));

  return dashboardSummaryResponseSchema.parse({
    summary: {
      totalTasks: tasks.length,
      completedTasks,
      pendingTasks,
      highPriorityTasks,
    },
    upcomingDeadlines,
  });
}
