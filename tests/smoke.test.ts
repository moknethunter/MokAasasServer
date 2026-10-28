process.env.NODE_ENV ??= 'test';
process.env.PORT ??= '3000';
process.env.HOST ??= '0.0.0.0';
process.env.VERSION ??= '0.1.0';
process.env.LOG_LEVEL ??= 'info';
process.env.ADMIN_USERNAME ??= 'admin';
process.env.ADMIN_PASSWORD_HASH ??= '$2a$12$testhashplaceholder000000000000000000000000000000000000';
process.env.SESSION_SECRET ??= 'test-secret-at-least-32-characters-long-for-ci';
process.env.SESSION_TTL_HOURS ??= '8';

import test from 'node:test';
import assert from 'node:assert/strict';

const { config } = await import('../src/config.js');

test('application config is valid in test mode', () => {
  assert.equal(config.NODE_ENV, 'test');
  assert.equal(config.PORT, 3000);
  assert.equal(config.HOST, '0.0.0.0');
  assert.ok(config.ADMIN_USERNAME.length >= 3);
  assert.ok(config.ADMIN_PASSWORD_HASH.length >= 20);
  assert.ok(config.SESSION_SECRET.length >= 32);
});
