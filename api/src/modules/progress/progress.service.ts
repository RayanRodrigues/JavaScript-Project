import { listTasksForUser } from '../tasks/tasks.service.js';
import { progressSummaryResponseSchema } from './progress.schema.js';

function toPercentage(value: number) {
  return Number(value.toFixed(2));
}

export async function getProgressSummary(userId: string) {
  const { tasks } = await listTasksForUser(userId, {
    status: 'all',
    limit: 100,
  });
  const completedTasks = tasks.filter((task) => task.status === 'completed').length;
  const completionRate = tasks.length === 0 ? 0 : toPercentage((completedTasks / tasks.length) * 100);

  const subjectMap = new Map<string, { totalTasks: number; completedTasks: number }>();

  for (const task of tasks) {
    const subject = task.subject ?? 'Uncategorized';
    const current = subjectMap.get(subject) ?? {
      totalTasks: 0,
      completedTasks: 0,
    };

    current.totalTasks += 1;

    if (task.status === 'completed') {
      current.completedTasks += 1;
    }

    subjectMap.set(subject, current);
  }

  const subjects = Array.from(subjectMap.entries())
    .map(([subject, values]) => ({
      subject,
      totalTasks: values.totalTasks,
      completedTasks: values.completedTasks,
      completionRate:
        values.totalTasks === 0 ? 0 : toPercentage((values.completedTasks / values.totalTasks) * 100),
    }))
    .sort((left, right) => right.totalTasks - left.totalTasks || left.subject.localeCompare(right.subject));

  return progressSummaryResponseSchema.parse({
    summary: {
      totalTasks: tasks.length,
      completedTasks,
      completionRate,
    },
    subjects,
  });
}
