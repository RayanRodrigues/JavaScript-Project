import type { FastifyInstance } from 'fastify';
import { getSystemHealth } from './system.service.js';

export async function registerSystemRoutes(app: FastifyInstance) {
  app.get('/health', async (_request, reply) => {
    try {
      return await getSystemHealth();
    } catch (error) {
      app.log.error(error);

      return reply.status(503).send({
        status: 'error',
        firebase: {
          connected: false,
        },
      });
    }
  });
}
