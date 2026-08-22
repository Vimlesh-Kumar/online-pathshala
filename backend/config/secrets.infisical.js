import { isUsable } from './secrets.registry.js';

/**
 * Infisical — the secret manager for deployed environments.
 *
 * Only three values live on the host (Render, Railway, a VM): the machine
 * identity's client id, its client secret, and the project id. Everything else
 * — database credentials, JWT secret, API keys — is pulled from Infisical at
 * boot, so rotating a secret never means editing the host's dashboard.
 *
 * Talks to the public REST API directly rather than pulling in the Infisical
 * SDK: two endpoints, no dependency, and the same style as groq.service.js.
 *
 *   POST /api/v1/auth/universal-auth/login   client id + secret -> access token
 *   GET  /api/v3/secrets/raw                 access token       -> the secrets
 *
 * Local development does not need any of this — leave the variables unset and
 * `.env.local` is used exactly as before.
 */

const DEFAULT_SITE_URL = 'https://app.infisical.com';

/** Infisical is unreachable or slow far less often than a boot can afford to hang. */
const TIMEOUT_MS = 10000;

/** Reads config lazily: the .env files are only loaded just before this runs. */
const config = () => ({
    // A self-hosted instance only differs by base URL.
    siteUrl: (process.env.INFISICAL_API_URL || DEFAULT_SITE_URL).replace(/\/+$/, ''),
    clientId: process.env.INFISICAL_CLIENT_ID,
    clientSecret: process.env.INFISICAL_CLIENT_SECRET,
    projectId: process.env.INFISICAL_PROJECT_ID,
    // Slug of the Infisical environment, as shown in its UI (dev / staging / prod).
    environment: process.env.INFISICAL_ENVIRONMENT ||
        (process.env.NODE_ENV === 'production' ? 'prod' : 'dev'),
    secretPath: process.env.INFISICAL_SECRET_PATH || '/'
});

/**
 * True when all three machine-identity values are present. Anything less is
 * treated as "not using Infisical" rather than as a misconfiguration, so a
 * developer who has none of them set is never blocked.
 */
export const isConfigured = () => {
    const { clientId, clientSecret, projectId } = config();
    return isUsable(clientId) && isUsable(clientSecret) && isUsable(projectId);
};

/** Describes where secrets are being read from, for the boot log. */
export const describe = () => {
    const { siteUrl, environment, secretPath } = config();
    const host = siteUrl.replace(/^https?:\/\//, '');
    return `Infisical (${host}, env: ${environment}, path: ${secretPath})`;
};

const request = async (url, options) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        const text = await response.text();

        let body = null;
        try {
            body = text ? JSON.parse(text) : null;
        } catch {
            // A non-JSON body means a proxy or an outage, not an API error.
            throw new Error(`Infisical returned a non-JSON response (HTTP ${response.status}).`);
        }

        if (!response.ok) {
            const detail = Array.isArray(body?.message)
                ? body.message.map((item) => item.message || item.code).join(', ')
                : body?.message || response.statusText;
            throw new Error(`Infisical request failed (HTTP ${response.status}): ${detail}`);
        }
        return body;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error(`Infisical did not respond within ${TIMEOUT_MS / 1000}s.`);
        }
        throw error;
    } finally {
        clearTimeout(timer);
    }
};

/** Exchange the machine identity for a short-lived access token. */
const login = async () => {
    const { siteUrl, clientId, clientSecret } = config();

    const body = await request(`${siteUrl}/api/v1/auth/universal-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, clientSecret })
    });

    if (!body?.accessToken) throw new Error('Infisical did not return an access token.');
    return body.accessToken;
};

/**
 * Fetch every secret for the configured project/environment/path.
 *
 * Secrets pulled in through Infisical's "imports" feature are included, but a
 * secret defined directly in this folder always wins over an imported one of
 * the same name — which is the precedence Infisical's own UI shows.
 *
 * @returns {Promise<Map<string, string>>} secret name -> value
 */
export const fetchSecrets = async () => {
    const { siteUrl, projectId, environment, secretPath } = config();
    const accessToken = await login();

    const url = new URL(`${siteUrl}/api/v3/secrets/raw`);
    url.searchParams.set('workspaceId', projectId);
    url.searchParams.set('environment', environment);
    url.searchParams.set('secretPath', secretPath);
    url.searchParams.set('includeImports', 'true');
    // Resolves ${OTHER_SECRET} references server-side.
    url.searchParams.set('expandSecretReferences', 'true');

    const body = await request(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    const values = new Map();

    // Imports first, so a directly-defined secret overwrites them below.
    for (const group of body?.imports || []) {
        for (const secret of group?.secrets || []) {
            if (secret?.secretKey) values.set(secret.secretKey, secret.secretValue ?? '');
        }
    }
    for (const secret of body?.secrets || []) {
        if (secret?.secretKey) values.set(secret.secretKey, secret.secretValue ?? '');
    }

    if (values.size === 0) {
        throw new Error(
            `Infisical returned no secrets for environment "${environment}" at path "${secretPath}". ` +
            'Check the environment slug and that the machine identity has read access to that path.'
        );
    }
    return values;
};
