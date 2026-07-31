#!/usr/bin/env node
/**
 * Diagnoses configuration without starting the server.
 *
 *   npm run secrets:check
 *
 * Reports, for every entry in the registry, whether a usable value resolved.
 * Values are never printed — only a masked fingerprint.
 */
import { bootstrapSecrets } from '../config/secrets.bootstrap.js';
import { SECRET_REGISTRY, VALKEY_REQUIREMENT, isUsable } from '../config/secrets.registry.js';

function mask(value) {
  if (!isUsable(value)) return '—';
  const text = String(value);
  if (text.length <= 8) return `${'*'.repeat(text.length)} (${text.length} chars)`;
  return `${text.slice(0, 3)}…${text.slice(-2)} (${text.length} chars)`;
}

// Note which vars were already in the real environment, to attribute each source.
const fromRealEnv = new Set(
  SECRET_REGISTRY.filter(({ envVar }) => isUsable(process.env[envVar])).map((e) => e.envVar)
);

let result;
try {
  result = bootstrapSecrets();
} catch (error) {
  console.error(`\n❌ ${error.message}\n`);
  process.exit(1);
}

const rows = SECRET_REGISTRY.map(({ envVar, required }) => {
  const value = process.env[envVar];
  const present = isUsable(value);
  let source = '—';
  if (present) source = fromRealEnv.has(envVar) ? 'environment' : 'env file';

  let status = '➖';
  if (present) status = '✅';
  else if (required) status = '❌';

  return { status, envVar, required: required ? 'yes' : 'no', source, value: mask(value) };
});

const width = (key, header) => Math.max(header.length, ...rows.map((r) => r[key].length));
const widths = {
  envVar: width('envVar', 'ENV VAR'),
  required: width('required', 'REQ'),
  source: width('source', 'SOURCE'),
};

console.log(
  `   ${'ENV VAR'.padEnd(widths.envVar)}  ${'REQ'.padEnd(widths.required)}  ` +
  `${'SOURCE'.padEnd(widths.source)}  VALUE`
);
console.log(`   ${'-'.repeat(widths.envVar + widths.required + widths.source + 20)}`);

for (const row of rows) {
  console.log(
    `${row.status} ${row.envVar.padEnd(widths.envVar)}  ${row.required.padEnd(widths.required)}  ` +
    `${row.source.padEnd(widths.source)}  ${row.value}`
  );
}

const { nodeEnv, missingRequired, valkeyOk } = result;
const isProduction = nodeEnv === 'production';

// Mirrors the bootstrap rule: fatal in production, tolerated in local development.
if (missingRequired.length > 0) {
  console.error(`\n❌ ${missingRequired.length} required value(s) missing: ${missingRequired.join(', ')}`);
  if (isProduction) process.exit(1);
  console.warn('   The server will still start in development, but those features will fail.\n');
}

if (!valkeyOk) {
  const detail = `${VALKEY_REQUIREMENT.label} is not configured. ${VALKEY_REQUIREMENT.hint}`;
  if (isProduction) {
    console.error(`\n❌ ${detail}\n`);
    process.exit(1);
  }
  console.warn(`\n⚠️  ${detail}`);
  console.warn('   The server will still start; caching will be disabled.\n');
}

if (missingRequired.length === 0 && valkeyOk) {
  console.log('\n✅ All required configuration resolved.\n');
}

process.exit(0);
