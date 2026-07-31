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

## Deployment

Set these in the host's environment settings — never commit a `.env` file:

```text
NODE_ENV=production
JWT_SECRET=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
MYSQL_DATABASE=
VALKEY_URI=rediss://default:<password>@<host>:<port>
CORS_ORIGIN=https://your-frontend-domain
```

Optional, per feature: `DB_CA_CERT`, `BLOB_READ_WRITE_TOKEN`, `BLOB_STORE_ID`,
`GROQ_API_KEY`, `GOOGLE_CREDENTIALS`, `GDRIVE_FOLDER_ID`.

- [ ] `NODE_ENV=production` is set — this makes missing configuration fatal instead of a warning
- [ ] `npm run secrets:check` exits 0 with the production environment loaded
- [ ] `CORS_ORIGIN` points at the real frontend domain, not `*`
- [ ] No secret values appear anywhere in the repository

---

## Rotating a credential

1. Rotate at the source (Aiven console, Vercel dashboard, Groq console).
2. Update the value in `.env.local` and in the host's environment settings.
3. Restart, then verify with `npm run secrets:check` and `npm run cache:ping`.

A credential that has ever been committed is compromised — rotate it rather than
just deleting the line, since it stays in git history.

---

## Common issues

| Symptom | Fix |
| --- | --- |
| `Missing required configuration` on boot | A required var is unset or still a placeholder — run `npm run secrets:check` |
| `Valkey connection is not configured` | Set `VALKEY_URI`, or all of `VALKEY_HOST` + `VALKEY_PORT` + `VALKEY_PASSWORD` |
| `WRONGPASS` | Wrong Valkey password — re-copy from the Aiven console |
| `Access denied for user` | Wrong `DB_USER` / `DB_PASSWORD` |
| Values in `.env.local` seem ignored | A real environment variable of the same name wins over the file — check your shell exports |
