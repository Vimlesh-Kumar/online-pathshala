/**
 * The single source of truth for every configuration value the backend needs.
 *
 * All values come from the environment: `.env.local` in development, `.env` (or the
 * host's real environment variables) everywhere else. `secrets.bootstrap.js` loads
 * them and validates this list at startup.
 *
 *   required: true  -> boot fails in production if the value is missing
 *   required: false -> optional feature; a missing value only logs a warning
 */
export const SECRET_REGISTRY = [
  // ── Authentication ────────────────────────────────────────────
  { envVar: 'JWT_SECRET', required: true },

  // ── Database (MySQL) ──────────────────────────────────────────
  { envVar: 'DB_HOST', required: true },
  { envVar: 'DB_PORT', required: false },
  { envVar: 'DB_USER', required: true },
  { envVar: 'DB_PASSWORD', required: true },
  { envVar: 'MYSQL_DATABASE', required: true },
  { envVar: 'DB_CA_CERT', required: false },

  // ── Cache (Aiven Valkey) ──────────────────────────────────────
  // Either supply the whole Service URI (`rediss://default:pw@host:port`, which is
  // what the Aiven console hands you) or the individual parts. See VALKEY_REQUIREMENT.
  { envVar: 'VALKEY_URI', required: false },
  { envVar: 'VALKEY_HOST', required: false },
  { envVar: 'VALKEY_PORT', required: false },
  { envVar: 'VALKEY_USERNAME', required: false },
  { envVar: 'VALKEY_PASSWORD', required: false },

  // ── Storage (Vercel Blob) ─────────────────────────────────────
  { envVar: 'BLOB_READ_WRITE_TOKEN', required: false },
  { envVar: 'BLOB_STORE_ID', required: false },

  // ── AI support (Groq) ─────────────────────────────────────────
  { envVar: 'GROQ_API_KEY', required: false },

  // ── Google Drive (lecture uploads) ────────────────────────────
  { envVar: 'GOOGLE_CREDENTIALS', required: false },
  { envVar: 'GDRIVE_FOLDER_ID', required: false },
];

/**
 * Cross-field rule: a Valkey connection can be described two equivalent ways.
 * Exactly one of these has to be satisfiable, which no per-entry `required` flag
 * can express on its own.
 */
export const VALKEY_REQUIREMENT = {
  label: 'Valkey connection',
  alternatives: [
    ['VALKEY_URI'],
    ['VALKEY_HOST', 'VALKEY_PORT', 'VALKEY_PASSWORD'],
  ],
  hint: 'Set VALKEY_URI to the Aiven Service URI (rediss://default:<password>@<host>:<port>), ' +
        'or set VALKEY_HOST + VALKEY_PORT + VALKEY_PASSWORD individually.',
};

/** True when at least one alternative of the Valkey requirement is fully satisfied. */
export function isValkeyConfigured(env = process.env) {
  return VALKEY_REQUIREMENT.alternatives.some(
    (group) => group.every((name) => isUsable(env[name]))
  );
}

/** Values that look like unreplaced template text — treated as "not set". */
const PLACEHOLDER_PATTERN = /^(your[_-]|update_with_|change[_-]?this|xxx+$|<.*>$)/i;

export function isPlaceholder(value) {
  return typeof value === 'string' && PLACEHOLDER_PATTERN.test(value.trim());
}

/** True when a value is genuinely usable (present, non-empty, not a placeholder). */
export function isUsable(value) {
  return typeof value === 'string' && value.trim() !== '' && !isPlaceholder(value);
}
