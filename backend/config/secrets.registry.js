/**
 * The single source of truth for every configuration value the backend needs.
 *
 * Where the values come from, highest precedence first:
 *   1. the host's own environment variables
 *   2. Infisical, when a machine identity is configured (see INFISICAL_* below)
 *   3. `.env.local` (development), then `.env`
 *
 * In production only (2) is a real source: every entry below is expected to live
 * in Infisical, and boot fails if the machine identity is missing. (1) stays as a
 * break-glass override for a single value; (3) is the local-development path.
 *
 * `secrets.bootstrap.js` resolves them in that order and validates this list at
 * startup.
 *
 *   required: true  -> boot fails in production if the value is missing
 *   required: false -> optional feature; a missing value only logs a warning
 *
 * NOTE: the INFISICAL_* entries below are deliberately *not* part of this list.
 * They are the credentials used to fetch everything else, so they have to exist
 * before a fetch can happen — they belong on the host, never inside Infisical.
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

  // ── Cache (Valkey) ────────────────────────────────────────────
  // Either supply the whole Service URI (`rediss://default:pw@host:port`, which is
  // what a hosted provider hands you) or the individual parts. See VALKEY_REQUIREMENT.
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

  // Optional: enriches YouTube channel links on the profile page. Video links
  // work without it (public oEmbed); channels are API-only.
  { envVar: 'YOUTUBE_API_KEY', required: false },

  // ── Google Drive (lecture uploads) ────────────────────────────
  { envVar: 'GOOGLE_CREDENTIALS', required: false },
  { envVar: 'GDRIVE_FOLDER_ID', required: false },
];

/**
 * The bootstrap credentials for Infisical itself.
 *
 * These are the only values that live on the host in production; every entry in
 * SECRET_REGISTRY above comes from Infisical. In development, set none of them
 * and the app reads `.env.local` / `.env` exactly as it always has.
 */
export const INFISICAL_VARS = [
  { envVar: 'INFISICAL_CLIENT_ID', bootstrap: true, hint: 'Machine identity client id (Universal Auth)' },
  { envVar: 'INFISICAL_CLIENT_SECRET', bootstrap: true, hint: 'Machine identity client secret' },
  { envVar: 'INFISICAL_PROJECT_ID', bootstrap: true, hint: 'Project id, from Project Settings' },
  { envVar: 'INFISICAL_ENVIRONMENT', hint: 'Environment slug (dev / staging / prod)' },
  { envVar: 'INFISICAL_SECRET_PATH', hint: 'Folder path, defaults to /' },
  { envVar: 'INFISICAL_API_URL', hint: 'Only for a self-hosted Infisical instance' },
];

/**
 * The three values a fetch cannot happen without. Production refuses to boot
 * unless all of them are set; the rest of INFISICAL_VARS have defaults.
 */
export const INFISICAL_BOOTSTRAP_VARS = INFISICAL_VARS
  .filter(({ bootstrap }) => bootstrap)
  .map(({ envVar }) => envVar);

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
