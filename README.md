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

### 🛠️ **Platform & Infrastructure**
- **Robust API**: RESTful architecture for efficient data handling.
- **Database Migrations**: Version-controlled database schema using `db-migrate`.
- **Responsive Design**: Mobile-first approach built on Tailwind CSS utilities, with a dark-first theme and a light mode toggle.

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

**Backend:**
- **Node.js**: Asynchronous event-driven JavaScript runtime.
- **Express.js**: Fast, unopinionated, minimalist web framework.
- **MySQL**: Relational database management.
- **JWT**: Industry-standard method for secure authentication.
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
| Backend (Express API) | **Render** | Free |
| Database | **Aiven for MySQL** | Free |

Config files are included: `render.yaml` (backend) and `frontend/vercel.json` (frontend).

---

## 📜 LICENSE
Distributed under the ISC License.

## ✍️ AUTHOR
**Vimlesh Kumar**
- GitHub: [@Vimlesh-Kumar](https://github.com/Vimlesh-Kumar)
