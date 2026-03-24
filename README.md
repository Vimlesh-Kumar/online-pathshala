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

### 🛠️ **Platform & Infrastructure**
- **Robust API**: RESTful architecture for efficient data handling.
- **Database Migrations**: Version-controlled database schema using `db-migrate`.
- **Responsive Design**: Mobile-first approach using Vuetify 3 components.

---

## 🛠️ TECH STACK

**Frontend:**
- **Vue 3**: The Progressive JavaScript Framework.
- **Vite**: Next-generation frontend tooling.
- **Vuetify 3**: Material Design component library.
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
# Configure your .env file based on .env.example
npm dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Configure your .env file
npm start
```

---

## 🚢 DEPLOYMENT RECOMMENDATIONS

For an "Always-On" experience (no sleep delay), we recommend:
1. **Frontend**: Vercel (Free)
2. **Backend**: Vercel Serverless Functions or Railway (Free trial)
3. **Database**: Aiven (Free MySQL)

---

## 📜 LICENSE
Distributed under the ISC License.

## ✍️ AUTHOR
**Vimlesh Kumar**
- GitHub: [@Vimlesh-Kumar](https://github.com/Vimlesh-Kumar)
