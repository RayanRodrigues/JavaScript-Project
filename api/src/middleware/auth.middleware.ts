import type { FastifyReply, FastifyRequest } from 'fastify';
import { sendError } from '../lib/http-errors.js';
import { verifyAuthToken } from '../modules/auth/auth.service.js';

function getBearerToken(authorizationHeader: string | undefined) {
  if (!authorizationHeader) {
    return null;
  }

  const parts = authorizationHeader.split(' ');

  if (parts.length !== 2) {
    return null;
  }

  const [scheme, token] = parts;

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const token = getBearerToken(request.headers.authorization);

  if (!token) {
    return sendError(reply, 401, 'unauthorized', 'Unauthorized');
  }

  try {
    request.user = await verifyAuthToken(token);
  } catch {
    return sendError(reply, 401, 'unauthorized', 'Unauthorized');
  }
}
