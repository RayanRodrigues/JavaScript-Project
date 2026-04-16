import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { getAppEnv } from '../config/env.js';
import { registerSwaggerDocs } from '../lib/swagger.js';
import { registerAuthRoutes } from '../modules/auth/auth.routes.js';
import { registerDashboardRoutes } from '../modules/dashboard/dashboard.routes.js';
import { registerProgressRoutes } from '../modules/progress/progress.routes.js';
import { registerScheduleRoutes } from '../modules/schedule/schedule.routes.js';
import { registerTaskRoutes } from '../modules/tasks/tasks.routes.js';

const API_PREFIX = '/api';
const SWAGGER_CSP_OPTIONS = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
    },
  },
};

export async function buildApp() {
  const appEnv = getAppEnv();
  const app = Fastify({
    logger: { level: 'warn' },
    disableRequestLogging: true,
  });

  app.setValidatorCompiler(() => {
    return (value) => ({ value });
  });

  await app.register(helmet, appEnv === 'production' ? {} : SWAGGER_CSP_OPTIONS);

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  await registerSwaggerDocs(app);

  await app.register(async (api) => {
    api.get('/health', {
      schema: {
        tags: ['System'],
        summary: 'Check API availability',
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['status'],
            properties: {
              status: { type: 'string', enum: ['ok'] },
            },
          },
        },
      },
    }, async () => ({ status: 'ok' }));

    await registerAuthRoutes(api);
    await registerDashboardRoutes(api);
    await registerProgressRoutes(api);
    await registerScheduleRoutes(api);
    await registerTaskRoutes(api);
  }, { prefix: API_PREFIX });

  return app;
}
