import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { listTasksForUser } from './tasks.service.js';

export async function registerTaskRoutes(app: FastifyInstance) {
  app.get('/tasks', { preHandler: requireAuth }, async (request) => {
    return listTasksForUser(request.user!.userId);
  });
}
