import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyAuthToken } from '../modules/auth/auth.service.js';

function getBearerToken(authorizationHeader: string | undefined) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const token = getBearerToken(request.headers.authorization);

  if (!token) {
    return reply.status(401).send({
      message: 'Unauthorized',
    });
  }

  try {
    request.user = await verifyAuthToken(token);
  } catch {
    return reply.status(401).send({
      message: 'Unauthorized',
    });
  }
}
