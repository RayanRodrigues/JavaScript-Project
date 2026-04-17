import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { createPrivateKey } from 'node:crypto';

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getProjectId() {
  return requireEnv('FIREBASE_PROJECT_ID');
}

export function normalizePrivateKey(value: string) {
  let normalized = value.trim();

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    try {
      normalized = JSON.parse(normalized);
    } catch {
      normalized = normalized.slice(1, -1);
    }
  }

  return normalized.replace(/\\n/g, '\n').replace(/\r\n?/g, '\n');
}

export function validatePrivateKey(privateKey: string) {
  try {
    createPrivateKey({ key: privateKey, format: 'pem' });
  } catch {
    throw new Error(
      'Invalid FIREBASE_PRIVATE_KEY: expected a valid PEM private key. On Render, store the Firebase private key value with escaped newlines or wrapped quotes.',
    );
  }
}

function getPrivateKey() {
  const privateKey = normalizePrivateKey(requireEnv('FIREBASE_PRIVATE_KEY'));
  validatePrivateKey(privateKey);

  return privateKey;
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

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminFirestore() {
  return getFirestore(getFirebaseAdminApp());
}
