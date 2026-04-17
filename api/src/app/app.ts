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
const SWAGGER_CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' https: data:",
].join('; ');

function getAllowedCorsOrigins(appEnv: ReturnType<typeof getAppEnv>) {
  const configuredOrigins = process.env.CORS_ORIGIN
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins && configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  if (appEnv === 'production') {
    throw new Error(
      'CORS_ORIGIN must be set in production. Use a comma-separated list of allowed frontend origins.',
    );
  }

  return ['http://localhost:5173'];
}

export async function buildApp() {
  const appEnv = getAppEnv();
  const allowedCorsOrigins = getAllowedCorsOrigins(appEnv);
  const app = Fastify({
    logger: { level: 'warn' },
    disableRequestLogging: true,
  });

  app.setValidatorCompiler(() => {
    return (value) => ({ value });
  });

  await app.register(helmet);

  if (appEnv !== 'production') {
    app.addHook('onSend', async (request, reply, payload) => {
      if (!request.url.startsWith('/docs')) {
        return payload;
      }

      reply.header('content-security-policy', SWAGGER_CSP_HEADER);

      return payload;
    });
  }

  await app.register(cors, {
    origin(origin, callback) {
      if (!origin || allowedCorsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'), false);
    },
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
