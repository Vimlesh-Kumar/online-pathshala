# Configuration & Secrets

Configuration is resolved from three sources. Highest precedence wins:

| # | Source | Used for |
| --- | --- | --- |
| 1 | The host's own environment variables | Emergency overrides, and the Infisical credentials themselves |
| 2 | **Infisical** — when a machine identity is configured | Everything, in deployment |
| 3 | `.env.local`, then `.env` | Local development |

**In production, Infisical is the only source.** The backend refuses to boot when
the machine identity is missing, rather than falling back to whatever happens to
be set on the host — a deploy configured by leftover dashboard variables is the
failure mode the secret manager exists to remove. Row 1 stays as a break-glass
override for a single value; row 3 never applies to a deployed environment.

Local development needs none of Infisical: leave the `INFISICAL_*` variables unset
and the app reads `.env.local` / `.env` exactly as before.

---

## Quick start (local)

```bash
cp .env.local.example .env.local
# fill in the values
npm run secrets:check     # verify configuration
npm run cache:ping        # verify the Valkey connection
npm run dev
```

---

## Production with Infisical

Only **three** values live on the host. Everything else lives in Infisical.

### 1. Create the project and load the secrets

1. Sign in at <https://app.infisical.com> and create a project.
2. Pick the environment you are configuring (`prod`).
3. `cp infisical.sample.env infisical.env`, fill in the real values.
   `infisical.env` is gitignored.
4. In Infisical: **Secrets → Add Secret ▾ → Import** and drop `infisical.env` in.
5. Delete your local `infisical.env`. Infisical is the store now.

### 2. Create a machine identity

1. **Project → Access Control → Machine Identities → Create**.
2. Auth method **Universal Auth**.
3. Give it **read** access to the `prod` environment (and the secret path, if you
   use folders).
4. Copy the **Client ID** and **Client Secret**.
5. Copy the **Project ID** from **Project Settings**.

### 3. Set the credentials on the host

Railway → your service → **Variables** (any host works the same way):

```text
NODE_ENV=production
INFISICAL_CLIENT_ID=<machine identity client id>
INFISICAL_CLIENT_SECRET=<machine identity client secret>
INFISICAL_PROJECT_ID=a37b412f-4c12-48a0-9857-d9fa40d3a6c9
```

`INFISICAL_ENVIRONMENT` defaults to `prod` whenever `NODE_ENV=production`, so it
is only needed for a staging deployment.

That is the entire host configuration — and it should stay that way. Adding
`DB_PASSWORD` or `JWT_SECRET` to the host does not supplement Infisical, it
*overrides* it (row 1 of the precedence table), so the value people rotate in
Infisical would silently stop being the one in use.

On boot you should see:

```text
🔐 Configuration
   Environment : production
   Source      : Infisical (app.infisical.com, env: prod, path: /)
   Secrets     : 12 loaded (files: environment variables only)
```

### Optional Infisical settings

| Env var | Default | Notes |
| --- | --- | --- |
| `INFISICAL_ENVIRONMENT` | `prod` in production, else `dev` | Environment **slug**, as shown in the Infisical UI |
| `INFISICAL_SECRET_PATH` | `/` | Folder path within the environment |
| `INFISICAL_API_URL` | `https://app.infisical.com` | Only for a self-hosted instance |

> The `INFISICAL_*` variables must never be stored *in* Infisical — they are the
> credentials used to read it. They are deliberately absent from
> `config/secrets.registry.js` for the same reason.

---

## How it works

```text
server.js
  └─ await bootstrapSecrets()        ← config/secrets.bootstrap.js
       ├─ dotenv.config()            ← .env.local (dev) or .env
       ├─ Infisical login + fetch    ← config/secrets.infisical.js (if configured)
       └─ validate the registry
  └─ await import('./app.js')        ← routers, DB pool, services built here
```

The ordering is deliberate and load-bearing. `database/database.js` opens its
connection pool at import time, and `user.controller.js`, `blob.service.js`,
`token_validation.js` and `sectionLectures.router.js` capture their values into
module-level constants at import time.

Because ES module imports are **hoisted**, calling `dotenv.config()` at the top of
`server.js` is not early enough — the routers would already have been evaluated. So
`server.js` resolves configuration first, then **dynamically** imports `app.js`. A
plain `import app from './app.js'` would silently reintroduce that bug.

Precedence is enforced with a snapshot of `process.env` taken before anything is
loaded: a key that was already in the real environment is never overwritten by
Infisical or by a file.

| File | Role |
| --- | --- |
| `config/secrets.registry.js` | Single source of truth: which vars exist, which are required |
| `config/secrets.infisical.js` | Fetches secrets from Infisical over its REST API |
| `config/secrets.bootstrap.js` | Resolves all three sources, then validates |
| `infisical.sample.env` | Template to fill in and upload to Infisical |

Infisical is reached over plain `fetch` — two endpoints, no SDK dependency:

```text
POST /api/v1/auth/universal-auth/login   client id + secret -> access token
GET  /api/v3/secrets/raw                 access token       -> the secrets
```

---

## Variables

| Env var | Required | Notes |
| --- | --- | --- |
| `JWT_SECRET` | ✅ | |
| `DB_HOST` | ✅ | |
| `DB_PORT` | – | defaults to 3306 |
| `DB_USER` | ✅ | |
| `DB_PASSWORD` | ✅ | |
| `MYSQL_DATABASE` | ✅ | |
| `DB_CA_CERT` | – | only for hosted MySQL requiring a CA |
| `VALKEY_URI` | one of † | full Service URI |
| `VALKEY_HOST` | one of † | |
| `VALKEY_PORT` | one of † | |
| `VALKEY_USERNAME` | – | most hosted providers use `default` |
| `VALKEY_PASSWORD` | one of † | |
| `VALKEY_TLS` | – | forces TLS on/off; auto for remote hosts |
| `BLOB_READ_WRITE_TOKEN` | – | Vercel Blob |
| `BLOB_STORE_ID` | – | |
| `GROQ_API_KEY` | – | AI flashcards, practice questions, support chat |
| `YOUTUBE_API_KEY` | – | YouTube *channel* link previews |
| `GOOGLE_CREDENTIALS` | – | Drive uploads, JSON string |
| `GDRIVE_FOLDER_ID` | – | |

† **Valkey needs either `VALKEY_URI` on its own, or `VALKEY_HOST` + `VALKEY_PORT` +
`VALKEY_PASSWORD` together.** See [VALKEY_SETUP.md](./VALKEY_SETUP.md).

Adding a value means adding one line to `config/secrets.registry.js`, and the
secret itself to Infisical.

---

## Validation rules

`npm run secrets:check` and server startup apply the same rules:

| | Development | Production |
| --- | --- | --- |
| Infisical not configured | ignored, `.env` files are used | **fatal**, server refuses to start |
| Infisical configured but unreachable | warning, falls back to `.env` | **fatal** |
| Required var missing | warning, server starts | **fatal**, server refuses to start |
| Valkey not configured | warning, caching disabled | **fatal** ‡ |

‡ Waived for schema tooling: `npm run db:setup` passes `requireCache: false`,
since a migration has no use for the cache.

Booting production with a half-loaded secret store would serve errors from a
process that looks healthy, so it fails loudly instead.

`secrets:check` exits non-zero on a production failure, so it works as a pre-deploy gate.

---

## Rules

- Never commit real values. Only `*.example` / `*.sample` files belong in git.
- `.env`, `.env.local`, `.env.*.local` and `infisical.env` are gitignored.
- A secret that has ever been committed is compromised — rotate it, don't just
  delete the line.
- Rotating a secret is an Infisical edit plus a restart; the host never changes.
