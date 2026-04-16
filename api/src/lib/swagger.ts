import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { z, type ZodTypeAny } from 'zod';

const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    issues: z.array(z.unknown()).optional(),
  }),
});

export const invalidRequestErrorJsonSchema = toOpenApiSchema(errorResponseSchema);
export const authErrorJsonSchema = toOpenApiSchema(errorResponseSchema);
export const notFoundErrorJsonSchema = toOpenApiSchema(errorResponseSchema);
export const internalErrorJsonSchema = toOpenApiSchema(errorResponseSchema);
export const bearerAuthSecurity = [{ bearerAuth: [] }];

export function toOpenApiSchema(schema: ZodTypeAny) {
  const jsonSchema = zodToJsonSchema(schema, {
    target: 'openApi3',
    $refStrategy: 'none',
    effectStrategy: 'input',
  });

  if ('$schema' in jsonSchema) {
    delete jsonSchema.$schema;
  }

  return jsonSchema;
}

export async function registerSwaggerDocs(app: FastifyInstance) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Study Planner API',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
  });
}
