# Online Pathshala 🎓
A robust Online Learning Management System (LMS) designed to empower learners and instructors. This full-stack application provides a seamless platform for course discovery, enrollment, and learning management.

---

## 🚀 LIVE DEMO
*(Add your Vercel URL here)*

## 📑 FEATURES

### 👤 **Student & User Experience**
- **Authentication**: Secure registration and login using JWT (JSON Web Tokens) and Bcrypt hashing.
- **Course Discovery**: Browse and search through various categories of courses with an intuitive UI.
- **Shopping Cart & Wishlist**: Save favorite courses and manage potential purchases easily.
- **Enrollment System**: Track your progress and manage enrolled courses.
- **Interactive Lessons**: Structured course content with sections and video lectures.
- **Timestamped Notes & Bookmarks**: Take notes while watching — each one is stamped with the exact second of the video. Click any timestamp to jump straight back to that moment, review everything on the **My Notes** page (search across courses, edit, delete) and export a course's notes as a PDF study sheet.
- **Resume Where You Left Off**: The playhead is checkpointed as you watch, so reopening a lesson picks up at the exact second you stopped — and the curriculum list shows where each lesson was left.
- **Streaks, XP & Achievements**: A daily learning streak, a 12-week activity heatmap, XP with levels, and twelve unlockable badges — all shown on **My Learning**. Lessons, notes, flashcard reviews and practice rounds all keep the streak alive.
- **AI Flashcards & Spaced Repetition**: Generate a deck from any enrolled course — built from its curriculum *and* your own notes — then review it on a **SuperMemo-2** schedule that shows each card right before you'd forget it. Rate a card *Again / Hard / Good / Easy* and it reschedules itself; failed cards come back later in the same session.
- **AI Practice Quizzes**: Unlimited practice questions per lesson or per course, generated from the course content and cached so repeat rounds are instant. Answers are graded server-side, with an explanation for every question and a "worth revisiting" list of your weak topics. Separate from the certificate quiz — practice as often as you like.
- **Study Goals & Weekly Planner**: Set a weekly lesson target, pick the days you intend to study, and watch a Monday-to-Sunday grid fill in. When you slip off pace, a nudge lands in your notification bell — at most once a day.
- **Leaderboard & Peer Challenges**: An opt-in weekly XP leaderboard (with an optional alias), plus head-to-head challenges: invite anyone by email and race them on lessons, flashcards or XP for 3–30 days. Challenges settle themselves and notify both sides.
- **Notification Centre**: A header bell for answers to your questions, new course announcements and certificates earned, with unread counts and one-click mark-as-read.
- **Rich Profile & Live Link Previews**: **My Learning** opens with your photo, headline, bio, location and social links, plus a profile-strength meter. On **Profile → Social Profiles**, each link you paste is read live: a GitHub URL pulls your real name, avatar, bio, repo and follower counts; a personal site or YouTube video pulls its title, description and preview image. LinkedIn and X are shown as handles only — both block automated reads, and the UI says so rather than faking it.
- **Certificate Verification**: Every certificate carries a public id — anyone can confirm it at `/verify/<id>` without an account.
- **Player Controls**: Playback speed (0.75×–2×) and 10-second skips, with `←` / `→` and `<` / `>` keyboard shortcuts.
- **Jump Back In**: The courses you viewed most recently, kept locally in the browser, one click from **My Learning**.

### 🎓 **Instructor Tools**
- **Instructor Dashboard**: Enrollments, ratings and revenue across your catalog.
- **Course Announcements**: Post an update to a course you own and every enrolled learner is notified instantly.

### 🛠️ **Platform & Infrastructure**
- **Robust API**: RESTful architecture for efficient data handling.
- **Database Migrations**: Version-controlled database schema using `db-migrate`.
- **Responsive Design**: Mobile-first approach built on Tailwind CSS utilities, with a dark-first theme and a light mode toggle.
- **Installable PWA & Offline Mode**: Install Pathshala to your home screen or desktop. A hand-written service worker caches the app shell, hashed assets and your API reads, so pages you have already opened keep working with no connection — with an offline banner, an update-ready prompt, and app shortcuts straight to flashcards, notes and goals. Cached API data is wiped on logout so a shared device never leaks the previous learner's data.

---

## 🛠️ TECH STACK

**Frontend:**
- **Vue 3**: The Progressive JavaScript Framework.
- **Vite**: Next-generation frontend tooling.
- **Tailwind CSS v4**: Utility-first styling with a dark-first design-token layer.
- **shadcn-vue (reka-ui)**: Accessible, copy-in component primitives — dialogs, selects, tabs, pagination.
- **Inspira UI (motion-v)**: Animated hero, card and text components for the marketing surfaces.
- **Iconify + Lucide**: Icons bundled offline as a generated subset (`npm run icons`).
- **Vuex/Vue Router**: Official state management and routing.
- **Axios**: Promised-based HTTP client for API communication.
- **PWA**: Web app manifest plus a dependency-free service worker (`public/sw.js`) — no build plugin involved.

**Backend:**
- **Node.js**: Asynchronous event-driven JavaScript runtime.
- **Express.js**: Fast, unopinionated, minimalist web framework.
- **MySQL**: Relational database management.
- **JWT**: Industry-standard method for secure authentication.
- **Groq (optional)**: Powers the AI flashcards, practice questions and support answers. Set `GROQ_API_KEY` to enable it — every AI feature falls back to a rule-based path built from the course's own content when it is absent or fails, so nothing ever breaks without it.
- **YouTube Data API (optional)**: Set `YOUTUBE_API_KEY` to enrich YouTube *channel* links on the profile page. Video links need no key (public oEmbed); channel pages are API-only because youtube.com answers 404 to every non-browser request.
- **SSRF-guarded link previews**: The preview endpoint fetches URLs the user supplies, so `utils/safeFetch.js` restricts it to public IPs (private, loopback, link-local and cloud-metadata ranges are blocked), standard ports, http(s) only, a 6s timeout, a 256 KB body cap, and manual redirects so every hop is re-checked. Results are cached in Valkey for 6 hours.
- **db-migrate**: Database migration tool for Node.js.

---

## ⚙️ INSTALLATION & SETUP

### Prerequisites
- Node.js (v18+)
- MySQL (v8+)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/online-pathshala.git
cd online-pathshala
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env      # then fill in your values
npm run db:setup          # creates all tables + seeds demo courses & users
# already have real data? `npm run db:schema` adds only the missing tables.
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:8000/ for local
npm start
```

### Demo accounts (seeded by `db:setup`)
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@test.com` | `Test@1234` |
| Student | `student@test.com` | `Test@1234` |
| Tutor | `tutor@test.com` | `Test@1234` |

---

## 🚢 DEPLOYMENT — 100% Free

Full step-by-step guide: **[DEPLOY.md](DEPLOY.md)**

| Piece | Service | Cost |
|-------|---------|------|
| Frontend (Vue SPA) | **Vercel** | Free |
| Backend (Express API) | **Railway** | Free |
| Database | **Aiven for MySQL** | Free |
| Cache | **Aiven for Valkey** | Free |
| Secrets | **Infisical** | Free |

The backend runs at <https://online-pathshala-production.up.railway.app>.
`frontend/vercel.json` holds the SPA rewrite rules.

**Secrets** live in an [Infisical](https://app.infisical.com) project, and in
production that is the *only* source — the backend refuses to boot without it.
Four variables sit on the host — `NODE_ENV`, `INFISICAL_CLIENT_ID`,
`INFISICAL_CLIENT_SECRET` and `INFISICAL_PROJECT_ID` — and everything else is
fetched at boot, so rotating a credential never means editing a hosting
dashboard. Fill in `backend/infisical.sample.env`
and import it in one go; full walkthrough in
**[backend/SECRETS_SETUP.md](backend/SECRETS_SETUP.md)**. Local development needs
none of it — `.env.local` works as before.

---

## 📜 LICENSE
Distributed under the ISC License.

## ✍️ AUTHOR
**Vimlesh Kumar**
- GitHub: [@Vimlesh-Kumar](https://github.com/Vimlesh-Kumar)
