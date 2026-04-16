import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { ZodError } from 'zod';
import {
  authCredentialsBodySchema,
  authLoginResponseSchema,
  authMeResponseSchema,
  authRegisterResponseSchema,
} from './auth.schema.js';
import { AuthError, loginUser, registerUser } from './auth.service.js';

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post('/auth/register', async (request, reply) => {
    try {
      const body = authCredentialsBodySchema.parse(request.body);

      return authRegisterResponseSchema.parse(await registerUser(body));
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          message: 'Invalid request data',
          issues: error.issues,
        });
      }

      if (error instanceof AuthError) {
        return reply.status(error.statusCode).send({
          message: error.message,
        });
      }

      app.log.error(error);

      return reply.status(500).send({
        message: 'Internal server error',
      });
    }
  });

  app.post('/auth/login', async (request, reply) => {
    try {
      const body = authCredentialsBodySchema.parse(request.body);

      return authLoginResponseSchema.parse(await loginUser(body));
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          message: 'Invalid request data',
          issues: error.issues,
        });
      }

      if (error instanceof AuthError) {
        return reply.status(error.statusCode).send({
          message: error.message,
        });
      }

      app.log.error(error);

      return reply.status(500).send({
        message: 'Internal server error',
      });
    }
  });

  app.get('/auth/me', { preHandler: requireAuth }, async (request) => {
    return authMeResponseSchema.parse({
      authenticated: true,
      user: request.user,
    });
  });
}
