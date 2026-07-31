import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SECRET_REGISTRY,
  VALKEY_REQUIREMENT,
  isUsable,
  isValkeyConfigured,
} from './secrets.registry.js';

// Resolved from this file, not from process.cwd(), so the same files are found
// whether the server is started from `backend/` or from the repo root.
const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Files are read in order and the first value found wins (`override: false`),
 * so real environment variables > .env.local > .env. Development keeps both:
 * `.env` holds the shared/committed-by-habit defaults, `.env.local` the personal
 * overrides. Production reads only `.env`; the host's variables are the real source.
 */
function envFilesFor(nodeEnv) {
  return nodeEnv === 'production' ? ['.env'] : ['.env.local', '.env'];
}

let loadResult = null;

/**
 * Hydrates process.env from the env files. Safe to call more than once — the
 * work happens on the first call only, so standalone scripts can import
 * `config/env.js` without fighting the server's own bootstrap.
 */
export function loadEnvFiles() {
  if (loadResult) return loadResult;

  const nodeEnv = process.env.NODE_ENV || 'development';
  const files = [];

  for (const name of envFilesFor(nodeEnv)) {
    const path = join(backendRoot, name);
    if (!existsSync(path)) continue;
    dotenv.config({ path, override: false, quiet: true });
    files.push(name);
  }

  loadResult = { nodeEnv, files };
  return loadResult;
}

/**
 * Loads configuration into process.env *before* the application modules are imported,
 * then validates it.
 *
 * This ordering is not optional: database.js opens its connection pool at import
 * time, and user.controller.js / blob.service.js / token_validation.js capture their
 * secrets into module-level constants at import time. Anything loaded after those
 * imports would be ignored — and ES module imports are hoisted, so calling
 * dotenv.config() at the top of server.js is *not* early enough on its own.
 *
 * Values already present in the real environment (Render, Railway, CI, a shell
 * export) always win over the files, so deployed configuration is never overridden.
 */
export function bootstrapSecrets() {
  const { nodeEnv, files } = loadEnvFiles();

  const missingRequired = SECRET_REGISTRY
    .filter(({ envVar, required }) => required && !isUsable(process.env[envVar]))
    .map(({ envVar }) => envVar);

  const valkeyOk = isValkeyConfigured();

  logSummary({ nodeEnv, files, missingRequired, valkeyOk });

  // Production must be fully configured; local development is allowed to run degraded.
  if (nodeEnv === 'production') {
    if (missingRequired.length > 0) {
      throw new Error(
        `Missing required configuration:\n  - ${missingRequired.join('\n  - ')}\n` +
        'Set them as environment variables on the host (or in backend/.env).'
      );
    }
    if (!valkeyOk) {
      throw new Error(`${VALKEY_REQUIREMENT.label} is not configured. ${VALKEY_REQUIREMENT.hint}`);
    }
  }

  return { nodeEnv, files, missingRequired, valkeyOk };
}

function logSummary({ nodeEnv, files, missingRequired, valkeyOk }) {
  console.log('\n🔐 Configuration');
  console.log(`   Environment : ${nodeEnv}`);
  console.log(`   Source      : ${files.length ? files.join(', ') : 'environment variables only'}`);

  if (missingRequired.length > 0) {
    console.warn(`   ⚠️  Missing  : ${missingRequired.join(', ')}`);
  }
  if (!valkeyOk) {
    console.warn(`   ⚠️  ${VALKEY_REQUIREMENT.label} not configured — caching will be disabled`);
  }
  console.log('');
}
