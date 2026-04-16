import { z } from 'zod';

const prioritySchema = z.enum(['low', 'medium', 'high']);
const statusSchema = z.enum(['pending', 'completed']);
const dueDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must use YYYY-MM-DD format');
const nullableTextField = z
  .string()
  .trim()
  .max(120)
  .transform((value) => (value.length === 0 ? null : value))
  .nullable();

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

export const listTasksQuerySchema = z
  .object({
    status: z.enum(['pending', 'completed', 'all']).optional().default('pending'),
    search: z.string().trim().max(120).optional(),
    priority: prioritySchema.optional(),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  })
  .strict();

export const createTaskBodySchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    subject: nullableTextField.optional(),
    dueDate: dueDateSchema.nullable().optional(),
    priority: prioritySchema.optional().nullable(),
  })
  .strict();

export const updateTaskParamsSchema = z.object({
  id: z.string().min(1),
});

export const updateTaskBodySchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    subject: nullableTextField.optional(),
    dueDate: dueDateSchema.nullable().optional(),
    priority: prioritySchema.optional().nullable(),
    status: statusSchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });

export type Task = z.infer<typeof taskSchema>;
export type CreateTaskBody = z.infer<typeof createTaskBodySchema>;
export type UpdateTaskBody = z.infer<typeof updateTaskBodySchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
