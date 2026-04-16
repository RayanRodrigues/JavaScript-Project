import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { getProgressSummary } from './progress.service.js';

export async function registerProgressRoutes(app: FastifyInstance) {
  app.get('/progress/summary', { preHandler: requireAuth }, async (request) => {
    return getProgressSummary(request.user!.userId);
  });
}
