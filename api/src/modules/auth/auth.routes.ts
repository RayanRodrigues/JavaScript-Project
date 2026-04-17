import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { sendError } from '../../lib/http-errors.js';
import {
  authErrorJsonSchema,
  bearerAuthSecurity,
  internalErrorJsonSchema,
  invalidRequestErrorJsonSchema,
  toOpenApiSchema,
} from '../../lib/swagger.js';
import { ZodError } from 'zod';
import {
  authCredentialsBodySchema,
  authLoginResponseSchema,
  authLogoutResponseSchema,
  authMeResponseSchema,
  authRegisterResponseSchema,
} from './auth.schema.js';
import { AuthError, loginUser, logoutUser, registerUser } from './auth.service.js';

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post('/auth/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Register a new user',
      body: toOpenApiSchema(authCredentialsBodySchema),
      response: {
        200: toOpenApiSchema(authRegisterResponseSchema),
        400: invalidRequestErrorJsonSchema,
        401: authErrorJsonSchema,
        500: internalErrorJsonSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const body = authCredentialsBodySchema.parse(request.body);

      return authRegisterResponseSchema.parse(await registerUser(body));
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(reply, 400, 'invalid_request', 'Invalid request data', error.issues);
      }

      if (error instanceof AuthError) {
        return sendError(reply, error.statusCode, 'auth_error', error.message);
      }

      app.log.error(error);

      return sendError(reply, 500, 'internal_error', 'Internal server error');
    }
  });

  app.post('/auth/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Authenticate an existing user',
      body: toOpenApiSchema(authCredentialsBodySchema),
      response: {
        200: toOpenApiSchema(authLoginResponseSchema),
        400: invalidRequestErrorJsonSchema,
        401: authErrorJsonSchema,
        500: internalErrorJsonSchema,
      },
    },
  }, async (request, reply) => {
    try {
      const body = authCredentialsBodySchema.parse(request.body);

      return authLoginResponseSchema.parse(await loginUser(body));
    } catch (error) {
      if (error instanceof ZodError) {
        return sendError(reply, 400, 'invalid_request', 'Invalid request data', error.issues);
      }

      if (error instanceof AuthError) {
        return sendError(reply, error.statusCode, 'auth_error', error.message);
      }

      app.log.error(error);

      return sendError(reply, 500, 'internal_error', 'Internal server error');
    }
  });

  app.get('/auth/me', {
    preHandler: requireAuth,
    schema: {
      tags: ['Auth'],
      summary: 'Return the authenticated user',
      security: bearerAuthSecurity,
      response: {
        200: toOpenApiSchema(authMeResponseSchema),
        401: authErrorJsonSchema,
      },
    },
  }, async (request) => {
    return authMeResponseSchema.parse({
      authenticated: true,
      user: request.user,
    });
  });

  app.post('/auth/logout', {
    preHandler: requireAuth,
    schema: {
      tags: ['Auth'],
      summary: 'Revoke the authenticated user session',
      security: bearerAuthSecurity,
      response: {
        200: toOpenApiSchema(authLogoutResponseSchema),
        401: authErrorJsonSchema,
        500: internalErrorJsonSchema,
      },
    },
  }, async (request, reply) => {
    try {
      return authLogoutResponseSchema.parse(await logoutUser(request.user!.userId));
    } catch (error) {
      app.log.error(error);

      return sendError(reply, 500, 'internal_error', 'Internal server error');
    }
  });
}
