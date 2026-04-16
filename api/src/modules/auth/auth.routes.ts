import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { authMeResponseSchema } from './auth.schema.js';

export async function registerAuthRoutes(app: FastifyInstance) {
  app.get('/auth/me', { preHandler: requireAuth }, async (request) => {
    return authMeResponseSchema.parse({
      authenticated: true,
      user: request.user,
    });
  });
}
