import type { FastifyInstance } from 'fastify';
import { authErrorJsonSchema, bearerAuthSecurity, toOpenApiSchema } from '../../lib/swagger.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { getScheduleSummary } from './schedule.service.js';
import { scheduleSummaryResponseSchema } from './schedule.schema.js';

export async function registerScheduleRoutes(app: FastifyInstance) {
  app.get('/schedule/summary', {
    preHandler: requireAuth,
    schema: {
      tags: ['Schedule'],
      summary: 'Return the schedule summary derived from due dates',
      security: bearerAuthSecurity,
      response: {
        200: toOpenApiSchema(scheduleSummaryResponseSchema),
        401: authErrorJsonSchema,
      },
    },
  }, async (request) => {
    return getScheduleSummary(request.user!.userId);
  });
}
