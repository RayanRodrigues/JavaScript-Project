import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import * as zodToJsonSchemaModule from 'zod-to-json-schema';
import { z } from 'zod';
import { getAppEnv } from '../config/env.js';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const swaggerUiPackagePath = require.resolve('@fastify/swagger-ui/package.json');
const swaggerStaticDir = path.join(path.dirname(swaggerUiPackagePath), 'static');
const swaggerAssetTypes: Record<string, string> = {
  'swagger-ui.css': 'text/css; charset=utf-8',
  'index.css': 'text/css; charset=utf-8',
  'swagger-ui-bundle.js': 'application/javascript; charset=utf-8',
  'swagger-ui-standalone-preset.js': 'application/javascript; charset=utf-8',
  'favicon-32x32.png': 'image/png',
  'favicon-16x16.png': 'image/png',
};

type OpenApiSchema = Record<string, unknown> & {
  $schema?: unknown;
};

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

export function toOpenApiSchema(schema: unknown) {
  const convertToJsonSchema = zodToJsonSchemaModule.zodToJsonSchema as (
    schema: unknown,
    options: Record<string, unknown>,
  ) => OpenApiSchema;

  const jsonSchema = convertToJsonSchema(schema, {
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
  if (getAppEnv() === 'production') {
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

  const cachedAssets = new Map<string, Buffer>();
  await Promise.all(
    Object.keys(swaggerAssetTypes).map(async (filename) => {
      cachedAssets.set(filename, await readFile(path.join(swaggerStaticDir, filename)));
    }),
  );

  for (const [filename, contentType] of Object.entries(swaggerAssetTypes)) {
    const asset = cachedAssets.get(filename)!;
    app.get(`/docs/static/${filename}`, {
      schema: { hide: true },
    }, (_request, reply) => {
      return reply.type(contentType).send(asset);
    });
  }
}
