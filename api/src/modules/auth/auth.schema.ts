import { z } from 'zod';

export const authenticatedUserSchema = z.object({
  userId: z.string(),
  email: z.string().email().nullable(),
});

export const authSessionSchema = z.object({
  idToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.string(),
});

export const authMeResponseSchema = z.object({
  authenticated: z.literal(true),
  user: authenticatedUserSchema,
});

export const authCredentialsBodySchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
}).strict();

export const authRegisterResponseSchema = z.object({
  user: authenticatedUserSchema,
  session: authSessionSchema,
});

export const authLoginResponseSchema = z.object({
  user: authenticatedUserSchema,
  session: authSessionSchema,
});

export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;
export type AuthMeResponse = z.infer<typeof authMeResponseSchema>;
export type AuthCredentialsBody = z.infer<typeof authCredentialsBodySchema>;
