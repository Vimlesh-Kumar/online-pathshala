# 🚀 Deploy Online Pathshala — 100% Free

This app runs entirely on free tiers:

| Piece | Service | Free tier |
|-------|---------|-----------|
| Database | **Aiven for MySQL** | Free plan (keeps your MySQL code as-is) |
| Backend (Express API) | **Render** | Free web service |
| Frontend (Vue SPA) | **Vercel** | Hobby (free) |

> ⚠️ Free Render web services **sleep after ~15 min idle**; the first request then
> takes ~50s to wake up. That is normal and costs nothing.

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

---

## 2. Backend — Render

**Option A — Blueprint (uses `render.yaml`):**

1. Push this repo to GitHub.
2. Render Dashboard → **New** → **Blueprint** → select the repo.
3. Render reads `render.yaml` and creates the `online-pathshala-api` web service.
4. When prompted, fill in the env vars (they are `sync: false` so nothing is committed):

   | Key | Value |
   |-----|-------|
   | `DB_HOST` | Aiven host |
   | `DB_PORT` | Aiven port |
   | `DB_USER` | `avnadmin` |
   | `DB_PASSWORD` | Aiven password |
   | `MYSQL_DATABASE` | `defaultdb` |
   | `DB_CA_CERT` | paste the full contents of `ca.pem` |
   | `JWT_SECRET` | the random string you generated |
   | `CORS_ORIGIN` | your Vercel URL (add after step 3) |

**Option B — Manual:** New → Web Service → repo → set **Root Directory** = `backend`,
**Build** = `npm install`, **Start** = `npm start`, then add the same env vars.

5. Deploy. Confirm it's healthy: open `https://<your-api>.onrender.com/health` → `{"status":"ok"}`.

---

## 3. Frontend — Vercel

1. Vercel → **Add New Project** → import the repo.
2. Set **Root Directory** = `frontend`. Framework preset: **Vite** (build `npm run build`, output `dist`).
3. Add an environment variable:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://<your-api>.onrender.com/` (trailing slash!) |

4. Deploy. Copy the resulting `*.vercel.app` URL.

---

## 4. Connect the two

1. In **Render**, set `CORS_ORIGIN` to your Vercel URL and redeploy (optional but recommended;
   omit it to allow all origins).
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
