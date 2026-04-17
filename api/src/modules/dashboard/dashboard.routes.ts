import type { FastifyInstance } from 'fastify';
import { authErrorJsonSchema, bearerAuthSecurity, toOpenApiSchema } from '../../lib/swagger.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { getDashboardSummary } from './dashboard.service.js';
import { dashboardSummaryResponseSchema } from './dashboard.schema.js';

export async function registerDashboardRoutes(app: FastifyInstance) {
  app.get('/dashboard/summary', {
    preHandler: requireAuth,
    schema: {
      tags: ['Dashboard'],
      summary: 'Return dashboard summary metrics',
      security: bearerAuthSecurity,
      response: {
        200: toOpenApiSchema(dashboardSummaryResponseSchema),
        401: authErrorJsonSchema,
      },
    },
  }, async (request) => {
    return getDashboardSummary(request.user!.userId);
  });
}
