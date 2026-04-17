import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { sendError } from '../../lib/http-errors.js';
import {
  authErrorJsonSchema,
  bearerAuthSecurity,
  internalErrorJsonSchema,
  invalidRequestErrorJsonSchema,
  notFoundErrorJsonSchema,
  toOpenApiSchema,
} from '../../lib/swagger.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import {
  createTaskBodySchema,
  listTasksQuerySchema,
  taskListResponseSchema,
  taskResponseSchema,
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
    return sendError(reply, 400, 'invalid_request', 'Invalid request data', error.issues);
  }

  if (error instanceof TaskNotFoundError) {
    return sendError(reply, 404, 'task_not_found', 'Task not found');
  }

  app.log.error(error);

  return sendError(reply, 500, 'internal_error', 'Internal server error');
}

export async function registerTaskRoutes(app: FastifyInstance) {
  app.get('/tasks', {
    preHandler: requireAuth,
    schema: {
      tags: ['Tasks'],
      summary: 'List tasks for the current user',
      security: bearerAuthSecurity,
      querystring: toOpenApiSchema(listTasksQuerySchema),
      response: {
        200: toOpenApiSchema(taskListResponseSchema),
        400: invalidRequestErrorJsonSchema,
        401: authErrorJsonSchema,
        500: internalErrorJsonSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const query = listTasksQuerySchema.parse(request.query);

      return await listTasksForUser(request.user!.userId, query);
    } catch (error) {
      return sendValidationError(app, reply, error);
    }
  });

  app.post('/tasks', {
    preHandler: requireAuth,
    schema: {
      tags: ['Tasks'],
      summary: 'Create a task',
      security: bearerAuthSecurity,
      body: toOpenApiSchema(createTaskBodySchema),
      response: {
        200: toOpenApiSchema(taskResponseSchema),
        400: invalidRequestErrorJsonSchema,
        401: authErrorJsonSchema,
        500: internalErrorJsonSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const body = createTaskBodySchema.parse(request.body);

      return await createTaskForUser(request.user!.userId, body);
    } catch (error) {
      return sendValidationError(app, reply, error);
    }
  });

  app.patch('/tasks/:id', {
    preHandler: requireAuth,
    schema: {
      tags: ['Tasks'],
      summary: 'Update a task',
      security: bearerAuthSecurity,
      params: toOpenApiSchema(updateTaskParamsSchema),
      body: toOpenApiSchema(updateTaskBodySchema),
      response: {
        200: toOpenApiSchema(taskResponseSchema),
        400: invalidRequestErrorJsonSchema,
        401: authErrorJsonSchema,
        404: notFoundErrorJsonSchema,
        500: internalErrorJsonSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const params = updateTaskParamsSchema.parse(request.params);
      const body = updateTaskBodySchema.parse(request.body);

      return await updateTaskForUser(request.user!.userId, params.id, body);
    } catch (error) {
      return sendValidationError(app, reply, error);
    }
  });

  app.delete('/tasks/:id', {
    preHandler: requireAuth,
    schema: {
      tags: ['Tasks'],
      summary: 'Delete a task',
      security: bearerAuthSecurity,
      params: toOpenApiSchema(updateTaskParamsSchema),
      response: {
        204: { type: 'null' },
        401: authErrorJsonSchema,
        404: notFoundErrorJsonSchema,
        500: internalErrorJsonSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const params = updateTaskParamsSchema.parse(request.params);

      await deleteTaskForUser(request.user!.userId, params.id);

      return reply.status(204).send();
    } catch (error) {
      return sendValidationError(app, reply, error);
    }
  });
}
