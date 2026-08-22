# Configuration Checklist

Short operational checklist. Full detail lives in
[SECRETS_SETUP.md](./SECRETS_SETUP.md) and [VALKEY_SETUP.md](./VALKEY_SETUP.md).

---

## Local development

```bash
cd backend
cp .env.local.example .env.local
# fill in JWT_SECRET, DB_*, and either VALKEY_URI or VALKEY_HOST/PORT/PASSWORD
npm install
npm run secrets:check     # every required value resolved?
npm run cache:ping        # cache actually reads and writes?
npm run dev
```

Expected on startup:

```text
🔐 Configuration
   Environment : development
   Source      : .env.local

🚀 Server is running on PORT: 8000
✅ Valkey connected to <host>:<port> (TLS)
```

- [ ] `.env.local` exists and is **not** tracked by git (`git status` should not list it)
- [ ] `npm run secrets:check` reports no missing required values
- [ ] `npm run cache:ping` passes
- [ ] MySQL is running and the schema is loaded (`npm run db:setup`)

---

## Deployment (Infisical only)

Infisical is the sole source of secrets in production — with no machine identity
the server refuses to boot. Two credentials go on the host:

```text
INFISICAL_CLIENT_ID=<machine identity client id>
INFISICAL_CLIENT_SECRET=<machine identity client secret>
```

`render.yaml` pins the other three (`NODE_ENV=production`,
`INFISICAL_PROJECT_ID`, `INFISICAL_ENVIRONMENT=prod`). Everything else —
`JWT_SECRET`, `DB_*`, `VALKEY_*`, `CORS_ORIGIN` and the optional per-feature keys
— is loaded from the Infisical project at boot. Fill in `infisical.sample.env`
and import it; full steps in [SECRETS_SETUP.md](./SECRETS_SETUP.md).

- [ ] `NODE_ENV=production` is set — this makes missing configuration fatal instead of a warning
- [ ] The machine identity has **read** access to the `prod` environment
- [ ] **No application secrets are set on Render.** A host variable wins over
      Infisical, so a leftover `DB_PASSWORD` there would shadow the one you rotate
- [ ] Boot log shows `Source : Infisical (...)` and a non-zero secret count
- [ ] `npm run secrets:check` exits 0 with the production environment loaded
- [ ] `CORS_ORIGIN` points at the real frontend domain, not `*`
- [ ] `infisical.env` was deleted locally after importing, and is not in git
- [ ] No secret values appear anywhere in the repository

---

## Rotating a credential

1. Rotate at the source (database provider console, Vercel dashboard, Groq console).
2. Update the value in Infisical (and in `.env.local` for local development).
3. Restart the service — the host's environment never changes.
4. Verify with `npm run secrets:check` and `npm run cache:ping`.

To rotate the Infisical machine identity itself, issue a new client secret in
**Access Control → Machine Identities**, update `INFISICAL_CLIENT_SECRET` on the
host, and revoke the old one.

A credential that has ever been committed is compromised — rotate it rather than
just deleting the line, since it stays in git history.

---

## Common issues

| Symptom | Fix |
| --- | --- |
| `Missing required configuration` on boot | A required var is unset or still a placeholder — run `npm run secrets:check` |
| `Valkey connection is not configured` | Set `VALKEY_URI`, or all of `VALKEY_HOST` + `VALKEY_PORT` + `VALKEY_PASSWORD` |
| `WRONGPASS` | Wrong Valkey password — re-copy it from your cache provider's console |
| `Access denied for user` | Wrong `DB_USER` / `DB_PASSWORD` |
| Values in `.env.local` seem ignored | A real environment variable of the same name wins over the file — check your shell exports |
| `Could not load secrets from Infisical: ... 401 Invalid credentials` | Wrong `INFISICAL_CLIENT_ID` / `INFISICAL_CLIENT_SECRET`, or the client secret was revoked |
| `Infisical returned no secrets for environment "prod"` | Wrong environment **slug**, wrong `INFISICAL_SECRET_PATH`, or the machine identity lacks read access to that path |
| Infisical values seem ignored | A variable of the same name is set on the host — the host always wins. Delete it from Render → Environment |
| `Infisical is the source of secrets in production, but its machine identity is not configured` | `INFISICAL_CLIENT_ID` / `INFISICAL_CLIENT_SECRET` / `INFISICAL_PROJECT_ID` are not all set on the host |
