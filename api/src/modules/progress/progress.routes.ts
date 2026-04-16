import type { FastifyInstance } from 'fastify';
import { authErrorJsonSchema, bearerAuthSecurity, toOpenApiSchema } from '../../lib/swagger.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { getProgressSummary } from './progress.service.js';
import { progressSummaryResponseSchema } from './progress.schema.js';

export async function registerProgressRoutes(app: FastifyInstance) {
  app.get('/progress/summary', {
    preHandler: requireAuth,
    schema: {
      tags: ['Progress'],
      summary: 'Return progress analytics for the current user',
      security: bearerAuthSecurity,
      response: {
        200: toOpenApiSchema(progressSummaryResponseSchema),
        401: authErrorJsonSchema,
      },
    },
  }, async (request) => {
    return getProgressSummary(request.user!.userId);
  });
}
