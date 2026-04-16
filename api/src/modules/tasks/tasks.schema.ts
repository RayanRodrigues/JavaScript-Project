import { z } from 'zod';

export const taskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  subject: z.string().nullable(),
  dueDate: z.string().nullable(),
  priority: z.enum(['low', 'medium', 'high']).nullable(),
  status: z.enum(['pending', 'completed']),
});

export const taskListResponseSchema = z.object({
  tasks: z.array(taskSchema),
});

export type Task = z.infer<typeof taskSchema>;
