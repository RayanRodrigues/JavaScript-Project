import type { FastifyReply } from 'fastify';
import type { ZodIssue } from 'zod';

export function sendError(
  reply: FastifyReply,
  statusCode: number,
  code: string,
  message: string,
  issues?: ZodIssue[],
) {
  return reply.status(statusCode).send({
    error: {
      code,
      message,
      ...(issues ? { issues } : {}),
    },
  });
}
