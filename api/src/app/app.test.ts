import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from './app.js';

const originalEnv = process.env.ENV;
const originalCorsOrigin = process.env.CORS_ORIGIN;

afterEach(() => {
  process.env.ENV = originalEnv;
  process.env.CORS_ORIGIN = originalCorsOrigin;
});

describe('app swagger docs', () => {
  it('serves the API under the /api prefix', async () => {
    process.env.ENV = 'test';

    const app = await buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });

    await app.close();
  });

  it('exposes swagger outside production', async () => {
    process.env.ENV = 'test';

    const app = await buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/docs/json',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().openapi).toBe('3.0.3');
    expect(response.json().paths['/api/health']).toBeTruthy();
    expect(response.json().paths['/api/auth/login']).toBeTruthy();

    await app.close();
  });

  it('does not expose swagger in production', async () => {
    process.env.ENV = 'production';

    const app = await buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/docs/json',
    });

    expect(response.statusCode).toBe(404);

    await app.close();
  });

  it('allows swagger ui assets in non-production CSP', async () => {
    process.env.ENV = 'test';

    const app = await buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/docs',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-security-policy']).toContain("script-src 'self' 'unsafe-inline'");
    expect(response.headers['content-security-policy']).toContain("style-src 'self' 'unsafe-inline'");
    expect(response.headers['content-security-policy']).not.toContain('upgrade-insecure-requests');

    await app.close();
  });

  it('keeps helmet defaults on non-doc routes outside production', async () => {
    process.env.ENV = 'test';

    const app = await buildApp();
    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-security-policy']).toContain("default-src 'self'");
    expect(response.headers['content-security-policy']).toContain('upgrade-insecure-requests');
    expect(response.headers['cross-origin-opener-policy']).toBe('same-origin');
    expect(response.headers['origin-agent-cluster']).toBe('?1');

    await app.close();
  });

  it('serves swagger ui static assets', async () => {
    process.env.ENV = 'test';

    const app = await buildApp();
    const cssResponse = await app.inject({
      method: 'GET',
      url: '/docs/static/swagger-ui.css',
    });
    const bundleResponse = await app.inject({
      method: 'GET',
      url: '/docs/static/swagger-ui-bundle.js',
    });

    expect(cssResponse.statusCode).toBe(200);
    expect(cssResponse.headers['content-type']).toContain('text/css');
    expect(bundleResponse.statusCode).toBe(200);
    expect(bundleResponse.headers['content-type']).toContain('application/javascript');

    await app.close();
  });

  it('throws when ENV is missing', async () => {
    delete process.env.ENV;

    await expect(buildApp()).rejects.toThrow('ENV must be set to development, test, or production');
  });

  it('throws when CORS_ORIGIN is missing in production', async () => {
    process.env.ENV = 'production';
    delete process.env.CORS_ORIGIN;

    await expect(buildApp()).rejects.toThrow(
      'CORS_ORIGIN must be set in production. Use a comma-separated list of allowed frontend origins.',
    );
  });

  it('allows configured CORS origins from a comma-separated list', async () => {
    process.env.ENV = 'production';
    process.env.CORS_ORIGIN =
      'https://study-planner-web.onrender.com, https://study-planner-preview.onrender.com';

    const app = await buildApp();
    const allowedResponse = await app.inject({
      method: 'OPTIONS',
      url: '/api/health',
      headers: {
        origin: 'https://study-planner-web.onrender.com',
        'access-control-request-method': 'GET',
      },
    });
    const blockedResponse = await app.inject({
      method: 'OPTIONS',
      url: '/api/health',
      headers: {
        origin: 'https://evil.example.com',
        'access-control-request-method': 'GET',
      },
    });

    expect(allowedResponse.statusCode).toBe(204);
    expect(allowedResponse.headers['access-control-allow-origin']).toBe(
      'https://study-planner-web.onrender.com',
    );
    expect(blockedResponse.statusCode).toBe(500);

    await app.close();
  });
});
