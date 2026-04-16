import { z } from 'zod';

const prioritySchema = z.enum(['low', 'medium', 'high']);
const statusSchema = z.enum(['pending', 'completed']);

export const taskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  subject: z.string().nullable(),
  dueDate: z.string().nullable(),
  priority: prioritySchema.nullable(),
  status: statusSchema,
});

export const taskListResponseSchema = z.object({
  tasks: z.array(taskSchema),
});

export const taskResponseSchema = z.object({
  task: taskSchema,
});

export const createTaskBodySchema = z.object({
  title: z.string().trim().min(1).max(120),
  subject: z.string().trim().max(120).optional().nullable(),
  dueDate: z.string().trim().max(40).optional().nullable(),
  priority: prioritySchema.optional().nullable(),
});

export const updateTaskParamsSchema = z.object({
  id: z.string().min(1),
});

export const updateTaskBodySchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  subject: z.string().trim().max(120).optional().nullable(),
  dueDate: z.string().trim().max(40).optional().nullable(),
  priority: prioritySchema.optional().nullable(),
  status: statusSchema.optional(),
});

export type Task = z.infer<typeof taskSchema>;
export type CreateTaskBody = z.infer<typeof createTaskBodySchema>;
export type UpdateTaskBody = z.infer<typeof updateTaskBodySchema>;
