# Configuration & Secrets

All configuration comes from environment variables — `.env.local` in development,
`.env` (or the host's own environment) in deployment. There is no secret manager in
the loop.

---

## Quick start

```bash
cp .env.local.example .env.local
# fill in the values
npm run secrets:check     # verify configuration
npm run cache:ping        # verify the Valkey connection
npm run dev
```

---

## How it works

```text
server.js
  └─ bootstrapSecrets()          ← config/secrets.bootstrap.js
       ├─ dotenv.config()        ← .env.local (dev) or .env
       └─ validate the registry
  └─ await import('./app.js')    ← routers, DB pool, services built here
```

The ordering is deliberate and load-bearing. `database/database.js` opens its
connection pool at import time, and `user.controller.js`, `blob.service.js`,
`token_validation.js` and `sectionLectures.router.js` capture their values into
module-level constants at import time.

Because ES module imports are **hoisted**, calling `dotenv.config()` at the top of
`server.js` is not early enough — the routers would already have been evaluated. So
`server.js` loads configuration first, then **dynamically** imports `app.js`. A plain
`import app from './app.js'` would silently reintroduce that bug.

| File | Role |
| --- | --- |
| `config/secrets.registry.js` | Single source of truth: which vars exist, which are required |
| `config/secrets.bootstrap.js` | Loads the env file and validates it |
| `app.js` | Express app and routes |
| `server.js` | Bootstrap → import app → listen |

Values already set in the real environment (Render, CI, a shell export) always win
over the file, so deployed configuration is never silently overridden.

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
| `VALKEY_URI` | one of † | full Aiven Service URI |
| `VALKEY_HOST` | one of † | |
| `VALKEY_PORT` | one of † | |
| `VALKEY_USERNAME` | – | Aiven uses `default` |
| `VALKEY_PASSWORD` | one of † | |
| `VALKEY_TLS` | – | forces TLS on/off; auto for remote hosts |
| `BLOB_READ_WRITE_TOKEN` | – | Vercel Blob |
| `BLOB_STORE_ID` | – | |
| `GROQ_API_KEY` | – | AI support |
| `GOOGLE_CREDENTIALS` | – | Drive uploads, JSON string |
| `GDRIVE_FOLDER_ID` | – | |

† **Valkey needs either `VALKEY_URI` on its own, or `VALKEY_HOST` + `VALKEY_PORT` +
`VALKEY_PASSWORD` together.** See [VALKEY_SETUP.md](./VALKEY_SETUP.md).

Adding a value means adding one line to `config/secrets.registry.js`.

---

## Validation rules

`npm run secrets:check` and server startup apply the same rules:

| | Development | Production |
| --- | --- | --- |
| Required var missing | warning, server starts | **fatal**, server refuses to start |
| Valkey not configured | warning, caching disabled | **fatal** |

The idea is that local development stays runnable while half-configured, but a
misconfigured production deploy fails loudly instead of silently serving errors.

`secrets:check` exits non-zero on a production failure, so it works as a pre-deploy gate.

---

## Deployment

Set the variables in your host's dashboard (Render → Environment, etc.). Do not ship a
`.env` file. At minimum:

```text
NODE_ENV=production
JWT_SECRET=...
DB_HOST=...
DB_USER=...
DB_PASSWORD=...
MYSQL_DATABASE=...
VALKEY_URI=rediss://default:<password>@<host>:<port>
```

---

## Rules

- Never commit real values. Only `*.example` files belong in git.
- `.env`, `.env.local` and `.env.*.local` are gitignored.
- A secret that has ever been committed is compromised — rotate it, don't just delete the line.
