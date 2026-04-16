import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { getDashboardSummary } from './dashboard.service.js';

export async function registerDashboardRoutes(app: FastifyInstance) {
  app.get('/dashboard/summary', { preHandler: requireAuth }, async (request) => {
    return getDashboardSummary(request.user!.userId);
  });
}
