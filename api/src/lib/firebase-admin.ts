import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getPrivateKey() {
  return requireEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');
}

function getProjectId() {
  return requireEnv('FIREBASE_PROJECT_ID');
}

export function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  return initializeApp({
    credential: cert({
      projectId: getProjectId(),
      clientEmail: requireEnv('FIREBASE_CLIENT_EMAIL'),
      privateKey: getPrivateKey(),
    }),
  });
}

export async function checkFirebaseConnection() {
  const app = getFirebaseAdminApp();
  const firestore = getFirestore(app);
  const healthRef = firestore.collection('system').doc('health');
  const snapshot = await healthRef.get();

  if (!snapshot.exists) {
    throw new Error('Firestore health document system/health was not found');
  }

  const data = snapshot.data();

  return {
    connected: true,
    projectId: getProjectId(),
    source: 'firestore',
    document: 'system/health',
    data: data ?? null,
  };
}
