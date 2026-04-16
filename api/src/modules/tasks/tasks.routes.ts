import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { requireAuth } from '../../middleware/auth.middleware.js';
import {
  createTaskBodySchema,
  updateTaskBodySchema,
  updateTaskParamsSchema,
} from './tasks.schema.js';
import {
  createTaskForUser,
  deleteTaskForUser,
  listTasksForUser,
  TaskNotFoundError,
  updateTaskForUser,
} from './tasks.service.js';

function sendValidationError(app: FastifyInstance, reply: FastifyReply, error: unknown) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Invalid request data',
      issues: error.issues,
    });
  }

  if (error instanceof TaskNotFoundError) {
    return reply.status(404).send({
      message: 'Task not found',
    });
  }

  app.log.error(error);

  return reply.status(500).send({
    message: 'Internal server error',
  });
}

export async function registerTaskRoutes(app: FastifyInstance) {
  app.get('/tasks', { preHandler: requireAuth }, async (request) => {
    return listTasksForUser(request.user!.userId);
  });

  app.post('/tasks', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const body = createTaskBodySchema.parse(request.body);

      return await createTaskForUser(request.user!.userId, body);
    } catch (error) {
      return sendValidationError(app, reply, error);
    }
  });

  app.patch('/tasks/:id', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const params = updateTaskParamsSchema.parse(request.params);
      const body = updateTaskBodySchema.parse(request.body);

      return await updateTaskForUser(request.user!.userId, params.id, body);
    } catch (error) {
      return sendValidationError(app, reply, error);
    }
  });

  app.delete('/tasks/:id', { preHandler: requireAuth }, async (request, reply) => {
    try {
      const params = updateTaskParamsSchema.parse(request.params);

      await deleteTaskForUser(request.user!.userId, params.id);

      return reply.status(204).send();
    } catch (error) {
      return sendValidationError(app, reply, error);
    }
  });
}
