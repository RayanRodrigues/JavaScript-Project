import { describe, expect, it } from 'vitest';
import { normalizePrivateKey, validatePrivateKey } from './firebase-admin.js';

describe('firebase admin env normalization', () => {
  const pem = [
    '-----BEGIN PRIVATE KEY-----',
    'line-1',
    'line-2',
    '-----END PRIVATE KEY-----',
  ].join('\n');

  it('converts escaped newlines into PEM newlines', () => {
    expect(
      normalizePrivateKey('-----BEGIN PRIVATE KEY-----\\nline-1\\nline-2\\n-----END PRIVATE KEY-----'),
    ).toBe(pem);
  });

  it('removes wrapping double quotes from hosted env values', () => {
    expect(
      normalizePrivateKey('"-----BEGIN PRIVATE KEY-----\\nline-1\\nline-2\\n-----END PRIVATE KEY-----"'),
    ).toBe(pem);
  });

  it('removes wrapping single quotes from hosted env values', () => {
    expect(
      normalizePrivateKey("'-----BEGIN PRIVATE KEY-----\\nline-1\\nline-2\\n-----END PRIVATE KEY-----'"),
    ).toBe(pem);
  });

  it('throws a clear error for malformed private keys', () => {
    expect(() => validatePrivateKey('not-a-private-key')).toThrow(
      'Invalid FIREBASE_PRIVATE_KEY: expected a valid PEM private key.',
    );
  });
});
