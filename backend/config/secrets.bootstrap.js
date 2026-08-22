import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  INFISICAL_BOOTSTRAP_VARS,
  SECRET_REGISTRY,
  VALKEY_REQUIREMENT,
  isUsable,
  isValkeyConfigured,
} from './secrets.registry.js';
import * as infisical from './secrets.infisical.js';

// Resolved from this file, not from process.cwd(), so the same files are found
// whether the server is started from `backend/` or from the repo root.
const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The variables that were already in the real environment, captured before any
 * file or secret manager can add to it.
 *
 * This is what makes precedence unambiguous: host environment > Infisical >
 * .env files. Without the snapshot, values loaded from `.env` would be
 * indistinguishable from ones the host set, and Infisical could neither
 * override the former nor respect the latter.
 */
const hostEnvKeys = new Set(Object.keys(process.env));

/**
 * Files are read in order and the first value found wins (`override: false`),
 * so real environment variables > .env.local > .env. Development keeps both:
 * `.env` holds the shared defaults, `.env.local` the personal overrides.
 *
 * Production reads only `.env`, and only ever as a way to carry the Infisical
 * machine identity when running production-mode tooling from a laptop — every
 * value in the registry comes from Infisical, which overwrites anything a file
 * put in process.env (files are not part of the host snapshot below).
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
 * Pulls secrets from Infisical into process.env, when a machine identity is
 * configured. Returns a short description of what happened, for the boot log.
 *
 * A variable the host set explicitly is never overwritten — that is the escape
 * hatch for pinning one value without touching the secret manager.
 */
async function applyInfisicalSecrets(nodeEnv) {
  if (!infisical.isConfigured()) return { used: false, count: 0 };

  const secrets = await infisical.fetchSecrets();

  let applied = 0;
  let skipped = 0;
  for (const [key, value] of secrets) {
    // `hostEnvKeys.has(key)` alone is not enough: Render declares every
    // `sync: false` variable, so an unanswered prompt arrives as an empty
    // string. Treating that as "the host set it" would shadow the real value
    // from Infisical and fail the boot with a variable that looks present.
    if (hostEnvKeys.has(key) && isUsable(process.env[key])) {
      skipped += 1;
      continue;
    }
    process.env[key] = value;
    applied += 1;
  }

  return { used: true, count: applied, skipped, source: infisical.describe(), nodeEnv };
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
 * Precedence, highest first:
 *   1. the host's own environment variables (Render, Railway, CI, a shell export)
 *   2. Infisical, when INFISICAL_CLIENT_ID / _CLIENT_SECRET / _PROJECT_ID are set
 *   3. .env.local, then .env
 *
 * In production Infisical is mandatory, not one option among three: a deploy that
 * silently ran on leftover host variables would be configured by whatever someone
 * last pasted into a dashboard, which is exactly what the secret manager exists to
 * replace. So boot stops when the machine identity is absent.
 */
export async function bootstrapSecrets({ requireCache = true } = {}) {
  const { nodeEnv, files } = loadEnvFiles();
  const isProduction = nodeEnv === 'production';

  if (isProduction && !infisical.isConfigured()) {
    const missing = INFISICAL_BOOTSTRAP_VARS.filter((name) => !isUsable(process.env[name]));
    throw new Error(
      'Infisical is the source of secrets in production, but its machine identity is not configured.\n' +
      `  Missing: ${missing.join(', ')}\n` +
      '  Set them on the host (Render → Environment). See backend/SECRETS_SETUP.md.'
    );
  }

  let infisicalResult = { used: false, count: 0 };
  let infisicalError = null;

  try {
    infisicalResult = await applyInfisicalSecrets(nodeEnv);
  } catch (error) {
    // In production the secret manager is the source of truth, so a failure is
    // fatal — booting with stale or partial configuration is worse than not
    // booting. Locally it is only ever a convenience, so carry on with .env.
    if (isProduction) {
      throw new Error(`Could not load secrets from Infisical: ${error.message}`);
    }
    infisicalError = error.message;
  }

  const missingRequired = SECRET_REGISTRY
    .filter(({ envVar, required }) => required && !isUsable(process.env[envVar]))
    .map(({ envVar }) => envVar);

  const valkeyOk = isValkeyConfigured();

  logSummary({ nodeEnv, files, missingRequired, valkeyOk, infisicalResult, infisicalError });

  // Production must be fully configured; local development is allowed to run degraded.
  if (isProduction) {
    if (missingRequired.length > 0) {
      throw new Error(
        `Missing required configuration:\n  - ${missingRequired.join('\n  - ')}\n` +
        `Add them to ${infisical.describe()}.`
      );
    }
    // Schema tools legitimately run without a cache, so they opt out of this one.
    if (requireCache && !valkeyOk) {
      throw new Error(`${VALKEY_REQUIREMENT.label} is not configured. ${VALKEY_REQUIREMENT.hint}`);
    }
  }

  return {
    nodeEnv,
    files,
    missingRequired,
    valkeyOk,
    infisical: { ...infisicalResult, error: infisicalError },
  };
}

function logSummary({ nodeEnv, files, missingRequired, valkeyOk, infisicalResult, infisicalError }) {
  const fileSource = files.length ? files.join(', ') : 'environment variables only';

  console.log('\n🔐 Configuration');
  console.log(`   Environment : ${nodeEnv}`);
  console.log(`   Source      : ${infisicalResult.used ? infisicalResult.source : fileSource}`);

  if (infisicalResult.used) {
    const skipped = infisicalResult.skipped
      ? `, ${infisicalResult.skipped} overridden by the host`
      : '';
    console.log(`   Secrets     : ${infisicalResult.count} loaded${skipped} (files: ${fileSource})`);
  }
  if (infisicalError) {
    console.warn(`   ⚠️  Infisical unavailable — using local files instead (${infisicalError})`);
  }
  if (missingRequired.length > 0) {
    console.warn(`   ⚠️  Missing  : ${missingRequired.join(', ')}`);
  }
  if (!valkeyOk) {
    console.warn(`   ⚠️  ${VALKEY_REQUIREMENT.label} not configured — caching will be disabled`);
  }
  console.log('');
}
