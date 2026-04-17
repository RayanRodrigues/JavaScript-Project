import { z } from 'zod';

export const progressSubjectSchema = z.object({
  subject: z.string(),
  totalTasks: z.number().int().nonnegative(),
  completedTasks: z.number().int().nonnegative(),
  completionRate: z.number().min(0).max(100),
});

export const progressSummaryResponseSchema = z.object({
  summary: z.object({
    totalTasks: z.number().int().nonnegative(),
    completedTasks: z.number().int().nonnegative(),
    completionRate: z.number().min(0).max(100),
  }),
  subjects: z.array(progressSubjectSchema),
});
