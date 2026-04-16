import type { AuthenticatedUser } from '../modules/auth/auth.schema.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}
