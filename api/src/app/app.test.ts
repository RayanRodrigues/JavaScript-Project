import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from './app.js';

const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
});

describe('app swagger docs', () => {
  it('exposes swagger outside production', async () => {
    process.env.NODE_ENV = 'test';

    const app = await buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/docs/json',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().openapi).toBe('3.0.3');

    await app.close();
  });

  it('does not expose swagger in production', async () => {
    process.env.NODE_ENV = 'production';

    const app = await buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/docs/json',
    });

    expect(response.statusCode).toBe(404);

    await app.close();
  });
});
