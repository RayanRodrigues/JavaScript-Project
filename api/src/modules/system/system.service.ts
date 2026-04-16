import { checkFirebaseConnection } from '../../lib/firebase-admin.js';

export async function getSystemHealth() {
  const firebase = await checkFirebaseConnection();

  return {
    status: 'ok' as const,
    firebase,
  };
}
