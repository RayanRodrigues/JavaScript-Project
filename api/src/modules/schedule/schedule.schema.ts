import { z } from 'zod';

export const scheduleTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  subject: z.string().nullable(),
  dueDate: z.string(),
  priority: z.enum(['low', 'medium', 'high']).nullable(),
  status: z.enum(['pending', 'completed']),
});

export const scheduleSummaryResponseSchema = z.object({
  summary: z.object({
    scheduledTasks: z.number().int().nonnegative(),
    overdueTasks: z.number().int().nonnegative(),
    completedTasks: z.number().int().nonnegative(),
  }),
  upcoming: z.array(scheduleTaskSchema),
  overdue: z.array(scheduleTaskSchema),
});
