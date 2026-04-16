import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { registerAuthRoutes } from '../modules/auth/auth.routes.js';
import { registerDashboardRoutes } from '../modules/dashboard/dashboard.routes.js';
import { registerProgressRoutes } from '../modules/progress/progress.routes.js';
import { registerTaskRoutes } from '../modules/tasks/tasks.routes.js';

export async function buildApp() {
  const app = Fastify({
    logger: { level: 'warn' },
    disableRequestLogging: true,
  });

  await app.register(helmet);

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  app.get('/health', async () => ({ status: 'ok' }));
  await registerAuthRoutes(app);
  await registerDashboardRoutes(app);
  await registerProgressRoutes(app);
  await registerTaskRoutes(app);

  return app;
}
