import { getFirebaseAdminAuth } from '../../lib/firebase-admin.js';
import type { AuthenticatedUser } from './auth.schema.js';

export async function verifyAuthToken(token: string): Promise<AuthenticatedUser> {
  const decodedToken = await getFirebaseAdminAuth().verifyIdToken(token);

  return {
    userId: decodedToken.uid,
    email: decodedToken.email ?? null,
  };
}
