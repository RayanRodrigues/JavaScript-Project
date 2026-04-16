import { z } from 'zod';

export const authenticatedUserSchema = z.object({
  userId: z.string(),
  email: z.string().email().nullable(),
});

export const authMeResponseSchema = z.object({
  authenticated: z.literal(true),
  user: authenticatedUserSchema,
});

export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;
export type AuthMeResponse = z.infer<typeof authMeResponseSchema>;
