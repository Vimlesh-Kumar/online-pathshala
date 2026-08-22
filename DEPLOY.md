# 🚀 Deploy Online Pathshala — 100% Free

This app runs entirely on free tiers:

| Piece | Service | Free tier |
|-------|---------|-----------|
| Database | **Aiven for MySQL** | Free plan (keeps your MySQL code as-is) |
| Backend (Express API) | **Railway** | Free trial / hobby |
| Frontend (Vue SPA) | **Vercel** | Hobby (free) |
| Secrets | **Infisical** | Free |

Live backend: <https://online-pathshala-production.up.railway.app>

---

## 0. One-time security cleanup (do this first)

Two secrets were committed to git history and **must be rotated** — they are public now:

1. **Aiven MySQL password** (`AVNS__…`) — delete that old Aiven service / reset the password.
2. **Google service-account key** (`backend/googlekey.json`) — in Google Cloud Console →
   IAM → Service Accounts, **delete the leaked key** and create a new one. The file is now
   git-ignored, so it stays local only.

Generate a fresh JWT secret for production:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## 1. Database — Aiven for MySQL

1. Sign up at <https://aiven.io> → **Create service** → **MySQL** → **Free plan** → pick a region.
2. Wait for it to turn green, then open the service overview and copy:
   - **Host**, **Port**, **User** (`avnadmin`), **Password**, **Database name** (`defaultdb`)
   - Download the **CA certificate** (`ca.pem`).
3. Provision the schema + seed data from your machine (one command):

   ```bash
   cd backend
   cp .env.example .env        # then edit .env: comment out the local block,
                               # fill in the Aiven block (Option B) + DB_SSL=true
   npm install
   npm run db:setup            # creates all tables + seeds 10 demo courses & 3 demo users
   ```

   You should see: `✅ Schema applied.` / `✅ Seed data applied.`

4. *(Optional)* Scale the catalog up to ~10,000 browsable courses (procedurally
   generated, reusing real working video lessons per category — free, no dataset needed):

   ```bash
   npm run catalog:generate    # safe to re-run; skips once the catalog already has 10,000+
   ```

---

## 2. Backend — Railway

1. Push this repo to GitHub.
2. Railway → **New Project** → **Deploy from GitHub repo** → select the repo, branch `main`.
3. Start command: `npm run start --prefix backend` (Railway injects its own `PORT`).
4. Secrets come from Infisical — production will not boot without it. Put every
   value in the Infisical project first (fill in `backend/infisical.sample.env`
   and import it), then set these four on the service under **Variables**:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `INFISICAL_CLIENT_ID` | machine identity client id |
   | `INFISICAL_CLIENT_SECRET` | machine identity client secret |
   | `INFISICAL_PROJECT_ID` | `a37b412f-4c12-48a0-9857-d9fa40d3a6c9` |

   `INFISICAL_ENVIRONMENT` defaults to `prod` when `NODE_ENV=production`, so it is
   optional. Do **not** add `DB_*`, `JWT_SECRET`, `VALKEY_*`, `CORS_ORIGIN` or
   `GROQ_API_KEY` here: a host variable wins over Infisical and would quietly
   become the real configuration.

   Full walkthrough: [backend/SECRETS_SETUP.md](backend/SECRETS_SETUP.md).

5. Apply the schema to the production database once, from your machine:

   ```bash
   cd backend
   NODE_ENV=production INFISICAL_CLIENT_ID=… INFISICAL_CLIENT_SECRET=… \
     INFISICAL_PROJECT_ID=a37b412f-4c12-48a0-9857-d9fa40d3a6c9 \
     npm run db:schema        # CREATE TABLE IF NOT EXISTS only — never touches existing data
   ```

   Re-run this after any release that adds tables, or the server logs
   `Database connection or schema migration failed` on boot.

6. Confirm it is healthy: `curl https://<your-app>.up.railway.app/health` → `{"status":"ok"}`.

## 3. Frontend — Vercel

1. Vercel → **Add New Project** → import the repo.
2. Set **Root Directory** = `frontend`. Framework preset: **Vite** (build `npm run build`, output `dist`).
3. Add an environment variable:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://online-pathshala-production.up.railway.app/` (trailing slash!) |

4. Deploy. Copy the resulting `*.vercel.app` URL.

---

## 4. Connect the two

1. In **Infisical** (`prod` environment), set `CORS_ORIGIN` to your Vercel URL and
   restart the Render service (optional but recommended; omit it to allow all origins).
2. Visit your Vercel URL and log in with a demo account:

   | Role | Email | Password |
   |------|-------|----------|
   | Admin | `admin@test.com` | `Test@1234` |
   | Student | `student@test.com` | `Test@1234` |
   | Tutor | `tutor@test.com` | `Test@1234` |

Done — free from dev to production. 🎉

---

## Local development

```bash
# 1. Start MySQL locally and set backend/.env to the local block (default)
cd backend && npm install && npm run db:setup   # tables + seed data
cd .. && npm install                            # root workspace deps

# 2. Run frontend + backend together
npm run dev        # frontend on :5173-ish (Vite), backend on :8000
```

Frontend talks to the backend via `VITE_API_URL` (defaults to `http://localhost:8000/`).
