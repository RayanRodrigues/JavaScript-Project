import { z } from 'zod';

export const dashboardDeadlineSchema = z.object({
  id: z.string(),
  title: z.string(),
  dueDate: z.string(),
  priority: z.enum(['low', 'medium', 'high']).nullable(),
  status: z.enum(['pending', 'completed']),
});

export const dashboardSummaryResponseSchema = z.object({
  summary: z.object({
    totalTasks: z.number().int().nonnegative(),
    completedTasks: z.number().int().nonnegative(),
    pendingTasks: z.number().int().nonnegative(),
    highPriorityTasks: z.number().int().nonnegative(),
  }),
  upcomingDeadlines: z.array(dashboardDeadlineSchema),
});
