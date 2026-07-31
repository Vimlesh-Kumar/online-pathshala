#!/usr/bin/env node
/**
 * Verifies the Valkey connection end to end: PING, then a SET/GET/DEL round trip.
 *
 *   npm run cache:ping
 *
 * Uses the same bootstrap as the server, so it exercises the real configuration.
 */
import { bootstrapSecrets } from '../config/secrets.bootstrap.js';

try {
  bootstrapSecrets();
} catch (error) {
  console.error(`\n❌ Bootstrap failed: ${error.message}\n`);
  process.exit(1);
}

// Imported after the bootstrap so it observes the hydrated env.
const { default: cacheService } = await import('../utils/cache.service.js');

const connected = await cacheService.initialize();
if (!connected) {
  console.error('\n❌ Could not connect to Valkey — see the error above.\n');
  process.exit(1);
}

// `initialize()` resolves once the socket is open; wait for the ready handshake.
const deadline = Date.now() + 10_000;
while (!cacheService.isConnected() && Date.now() < deadline) {
  await new Promise((resolve) => setTimeout(resolve, 100));
}

if (!cacheService.isConnected()) {
  console.error('\n❌ Connected but never became ready (auth or TLS problem).\n');
  await cacheService.close();
  process.exit(1);
}

const key = `healthcheck:${Date.now()}`;
const payload = { ok: true, at: new Date().toISOString() };

const wrote = await cacheService.set(key, payload, 30);
const raw = await cacheService.get(key);
const readBack = raw ? JSON.parse(raw) : null;
await cacheService.del(key);

if (!wrote || readBack?.at !== payload.at) {
  console.error(`\n❌ Round trip failed — wrote: ${wrote}, read back: ${JSON.stringify(readBack)}\n`);
  await cacheService.close();
  process.exit(1);
}

console.log(`✅ SET/GET/DEL round trip succeeded (key: ${key}, TTL 30s)`);
console.log('\n✅ Valkey is working.\n');

await cacheService.close();
process.exit(0);
