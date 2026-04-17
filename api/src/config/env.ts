import { z } from 'zod';

const envSchema = z.object({
  ENV: z.enum(['development', 'test', 'production']),
});

export type AppEnv = z.infer<typeof envSchema>['ENV'];

export function getAppEnv(): AppEnv {
  const result = envSchema.safeParse({
    ENV: process.env.ENV,
  });

  if (!result.success) {
    throw new Error('ENV must be set to development, test, or production');
  }

  return result.data.ENV;
}
