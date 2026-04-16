import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { getScheduleSummary } from './schedule.service.js';

export async function registerScheduleRoutes(app: FastifyInstance) {
  app.get('/schedule/summary', { preHandler: requireAuth }, async (request) => {
    return getScheduleSummary(request.user!.userId);
  });
}
