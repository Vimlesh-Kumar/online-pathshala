<template>
  <v-footer class="footer-shell">
    <v-container class="py-10 py-md-16">
      <!-- Top wave divider -->
      <div class="footer-divider mb-10"></div>

      <v-row class="footer-panel pa-8 pa-md-12" no-gutters>
        <!-- Brand + Developer Spotlight -->
        <v-col cols="12" lg="5" class="pr-lg-12 mb-10 mb-lg-0">
          <div class="d-flex align-center mb-6">
            <div class="footer-brand-icon mr-4">
              <v-icon color="white" size="28">mdi-school</v-icon>
            </div>
            <div>
              <div class="footer-brand gradient-text">Online Pathshala</div>
              <div class="footer-tagline">Learn anything, beautifully</div>
            </div>
          </div>

          <p class="footer-copy mb-6">
            A full-stack learning management platform built with modern web technologies.
            Designed and developed as a comprehensive project showcasing end-to-end software engineering skills.
          </p>

          <!-- Developer Info Card -->
          <div class="dev-card pa-5 mb-6">
            <div class="dev-card-label mb-2">
              <v-icon size="14" class="mr-1" color="#7c3aed">mdi-code-tags</v-icon>
              Developed by
            </div>
            <div class="dev-name mb-1">Vimlesh Kumar</div>
            <div class="dev-role">Full Stack Developer</div>
            <div class="d-flex flex-wrap ga-2 mt-4">
              <a href="https://github.com/Vimlesh-Kumar" target="_blank" rel="noopener" class="social-btn" aria-label="GitHub">
                <v-icon size="18">mdi-github</v-icon>
              </a>
              <a href="https://linkedin.com/in/vimlesh11" target="_blank" rel="noopener" class="social-btn" aria-label="LinkedIn">
                <v-icon size="18">mdi-linkedin</v-icon>
              </a>
              <a href="mailto:vimlesh11072000@gmail.com" class="social-btn" aria-label="Email">
                <v-icon size="18">mdi-email-outline</v-icon>
              </a>
              <a href="https://vimlesh.dev" target="_blank" rel="noopener" class="social-btn" aria-label="Portfolio">
                <v-icon size="18">mdi-globe</v-icon>
              </a>
            </div>
          </div>
        </v-col>

        <!-- Navigation Links -->
        <v-col cols="6" sm="4" lg="2" class="mb-8 mb-lg-0">
          <div class="footer-heading">Explore</div>
          <div class="footer-links">
            <button class="footer-link" @click="$router.push('/')">
              <v-icon size="14" class="mr-2">mdi-home-outline</v-icon>Home
            </button>
            <button class="footer-link" @click="$router.push('/courses/all')">
              <v-icon size="14" class="mr-2">mdi-bookshelf</v-icon>Courses
            </button>
            <button class="footer-link" @click="$router.push('/user')">
              <v-icon size="14" class="mr-2">mdi-school-outline</v-icon>My Learning
            </button>
            <button class="footer-link" @click="$router.push('/user/cart')">
              <v-icon size="14" class="mr-2">mdi-cart-outline</v-icon>Cart
            </button>
            <button class="footer-link" @click="$router.push('/user/wishlist')">
              <v-icon size="14" class="mr-2">mdi-heart-outline</v-icon>Wishlist
            </button>
          </div>
        </v-col>

        <!-- For Instructors -->
        <v-col cols="6" sm="4" lg="2" class="mb-8 mb-lg-0">
          <div class="footer-heading">For Instructors</div>
          <div class="footer-links">
            <button class="footer-link" @click="$router.push('/user/tutor/dashboard')">
              <v-icon size="14" class="mr-2">mdi-view-dashboard-outline</v-icon>Dashboard
            </button>
            <button class="footer-link" @click="$router.push('/user/tutor/add-course')">
              <v-icon size="14" class="mr-2">mdi-plus-circle-outline</v-icon>Create Course
            </button>
            <button class="footer-link" @click="$router.push('/user/orders')">
              <v-icon size="14" class="mr-2">mdi-receipt-text-outline</v-icon>Orders
            </button>
            <button class="footer-link" @click="$router.push('/user/profile')">
              <v-icon size="14" class="mr-2">mdi-account-circle-outline</v-icon>Profile
            </button>
            <a href="https://github.com/Vimlesh-Kumar/online-pathshala" target="_blank" rel="noopener" class="footer-link">
              <v-icon size="14" class="mr-2">mdi-github</v-icon>Source Code
            </a>
          </div>
        </v-col>

        <!-- Tech Stack + Categories -->
        <v-col cols="12" sm="4" lg="3">
          <div class="footer-heading">Built With</div>
          <div class="d-flex flex-wrap ga-2 mb-8">
            <span class="tech-badge" v-for="tech in techStack" :key="tech.name">
              <v-icon size="13" class="mr-1">{{ tech.icon }}</v-icon>{{ tech.name }}
            </span>
          </div>

          <div class="footer-heading">Categories</div>
          <div class="d-flex flex-wrap ga-2">
            <v-chip
              v-for="cat in category.slice(0, 6)"
              :key="cat"
              variant="outlined"
              rounded="pill"
              size="small"
              class="footer-chip"
              @click="handleCategorySelect(cat)"
            >
              {{ cat }}
            </v-chip>
          </div>
        </v-col>
      </v-row>

      <!-- Stats Bar -->
      <div class="stats-bar mt-8 pa-6">
        <v-row no-gutters justify="center" class="text-center">
          <v-col v-for="stat in stats" :key="stat.label" cols="6" sm="3">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </v-col>
        </v-row>
      </div>

      <!-- Bottom Bar -->
      <div class="bottom-bar mt-8 px-4">
        <div class="d-flex flex-column flex-md-row justify-space-between align-center ga-3">
          <div class="d-flex align-center ga-2">
            <span class="pulse-dot"></span>
            <span class="bottom-text">© {{ currentYear }} Online Pathshala — All rights reserved</span>
          </div>
          <div class="d-flex align-center ga-1 bottom-text">
            <span>Made with</span>
            <v-icon size="14" color="#f43f5e" class="heart-beat">mdi-heart</v-icon>
            <span>by <strong class="gradient-text">Vimlesh Kumar</strong></span>
          </div>
          <div class="d-flex ga-4">
            <button class="bottom-link" @click="activeModal = 'privacy'">Privacy</button>
            <button class="bottom-link" @click="activeModal = 'terms'">Terms</button>
            <button class="bottom-link" @click="activeModal = 'contact'">Contact</button>
          </div>
        </div>
      </div>

      <!-- ── Privacy Policy Modal ──────────────── -->
      <v-dialog v-model="showPrivacy" max-width="680" scrollable>
        <div class="modal-shell pa-8 pa-md-10">
          <div class="d-flex justify-space-between align-center mb-6">
            <div class="d-flex align-center ga-3">
              <div class="modal-icon modal-icon--purple"><v-icon color="white" size="22">mdi-shield-lock-outline</v-icon></div>
              <h2 class="modal-title">Privacy Policy</h2>
            </div>
            <v-btn icon variant="text" size="small" @click="activeModal = ''"><v-icon>mdi-close</v-icon></v-btn>
          </div>
          <div class="modal-body">
            <p class="modal-section-label">Last updated: July 2026</p>

            <h3 class="modal-heading">Data We Collect</h3>
            <p>We collect only the information necessary to provide a great learning experience — your name, email address, and profile picture when you sign up. Course progress, quiz results, and purchase history are stored to personalize your dashboard.</p>

            <h3 class="modal-heading">How We Use It</h3>
            <p>Your data powers your personalized experience: course recommendations, progress tracking, and certificate generation. We never sell your information to third parties.</p>

            <h3 class="modal-heading">Data Storage & Security</h3>
            <p>All data is stored securely using encrypted connections (HTTPS/TLS). Passwords are hashed using industry-standard algorithms. Media assets are stored on Vercel Blob Storage with private access controls.</p>

            <h3 class="modal-heading">Cookies</h3>
            <p>We use local storage to maintain your session token. No third-party tracking cookies are used on this platform.</p>

            <h3 class="modal-heading">Your Rights</h3>
            <p>You can update or delete your profile at any time from the account settings page. For full data deletion requests, contact us at the email below.</p>

            <div class="modal-contact-strip mt-6">
              <v-icon size="16" class="mr-2" color="#7c3aed">mdi-email-outline</v-icon>
              <span>Questions? Reach out at <strong>vimlesh11072000@gmail.com</strong></span>
            </div>
          </div>
        </div>
      </v-dialog>

      <!-- ── Terms of Use Modal ────────────────── -->
      <v-dialog v-model="showTerms" max-width="680" scrollable>
        <div class="modal-shell pa-8 pa-md-10">
          <div class="d-flex justify-space-between align-center mb-6">
            <div class="d-flex align-center ga-3">
              <div class="modal-icon modal-icon--blue"><v-icon color="white" size="22">mdi-file-document-outline</v-icon></div>
              <h2 class="modal-title">Terms of Use</h2>
            </div>
            <v-btn icon variant="text" size="small" @click="activeModal = ''"><v-icon>mdi-close</v-icon></v-btn>
          </div>
          <div class="modal-body">
            <p class="modal-section-label">Effective: July 2026</p>

            <h3 class="modal-heading">Acceptance</h3>
            <p>By accessing Online Pathshala, you agree to these terms. If you don't agree, please don't use the platform.</p>

            <h3 class="modal-heading">User Accounts</h3>
            <p>You are responsible for maintaining the security of your account credentials. One account per person — sharing accounts is not permitted.</p>

            <h3 class="modal-heading">Course Content</h3>
            <p>All course materials are the intellectual property of their respective instructors. You may access purchased courses for personal learning only. Redistributing, downloading, or sharing course content is prohibited.</p>

            <h3 class="modal-heading">Instructor Responsibilities</h3>
            <p>Instructors are responsible for the accuracy and originality of their course content. Online Pathshala reserves the right to remove content that violates community guidelines.</p>

            <h3 class="modal-heading">Payments & Refunds</h3>
            <p>All purchases are processed securely. Refund requests can be submitted within 7 days of purchase if less than 20% of the course has been completed.</p>

            <h3 class="modal-heading">Platform Usage</h3>
            <p>Automated scraping, abuse of the support system, or attempts to manipulate reviews are grounds for account suspension.</p>

            <div class="modal-contact-strip mt-6">
              <v-icon size="16" class="mr-2" color="#6366f1">mdi-gavel</v-icon>
              <span>These terms may be updated. We'll notify registered users via email.</span>
            </div>
          </div>
        </div>
      </v-dialog>

      <!-- ── Contact Modal ─────────────────────── -->
      <v-dialog v-model="showContact" max-width="680" scrollable>
        <div class="modal-shell pa-8 pa-md-10">
          <div class="d-flex justify-space-between align-center mb-6">
            <div class="d-flex align-center ga-3">
              <div class="modal-icon modal-icon--cyan"><v-icon color="white" size="22">mdi-message-text-outline</v-icon></div>
              <h2 class="modal-title">Get In Touch</h2>
            </div>
            <v-btn icon variant="text" size="small" @click="activeModal = ''"><v-icon>mdi-close</v-icon></v-btn>
          </div>
          <div class="modal-body">
            <p class="mb-6" style="color: var(--text-soft); line-height: 1.7;">
              I'm always open to feedback, collaboration, or just a friendly hello. Feel free to reach out through any of the channels below.
            </p>

            <div class="contact-cards">
              <a href="mailto:vimlesh11072000@gmail.com" class="contact-card">
                <div class="contact-card-icon" style="background: linear-gradient(135deg, #7c3aed, #6366f1);">
                  <v-icon color="white" size="22">mdi-email-fast-outline</v-icon>
                </div>
                <div>
                  <div class="contact-card-label">Email</div>
                  <div class="contact-card-value">vimlesh11072000@gmail.com</div>
                </div>
                <v-icon size="16" class="ml-auto" color="#94a3b8">mdi-arrow-top-right</v-icon>
              </a>

              <a href="https://github.com/Vimlesh-Kumar" target="_blank" rel="noopener" class="contact-card">
                <div class="contact-card-icon" style="background: linear-gradient(135deg, #1e293b, #334155);">
                  <v-icon color="white" size="22">mdi-github</v-icon>
                </div>
                <div>
                  <div class="contact-card-label">GitHub</div>
                  <div class="contact-card-value">github.com/Vimlesh-Kumar</div>
                </div>
                <v-icon size="16" class="ml-auto" color="#94a3b8">mdi-arrow-top-right</v-icon>
              </a>

              <a href="https://linkedin.com/in/vimlesh11" target="_blank" rel="noopener" class="contact-card">
                <div class="contact-card-icon" style="background: linear-gradient(135deg, #0077b5, #00a0dc);">
                  <v-icon color="white" size="22">mdi-linkedin</v-icon>
                </div>
                <div>
                  <div class="contact-card-label">LinkedIn</div>
                  <div class="contact-card-value">linkedin.com/in/vimlesh11</div>
                </div>
                <v-icon size="16" class="ml-auto" color="#94a3b8">mdi-arrow-top-right</v-icon>
              </a>

              <a href="https://vimlesh.dev" target="_blank" rel="noopener" class="contact-card">
                <div class="contact-card-icon" style="background: linear-gradient(135deg, #7c3aed, #ec4899);">
                  <v-icon color="white" size="22">mdi-globe</v-icon>
                </div>
                <div>
                  <div class="contact-card-label">Portfolio</div>
                  <div class="contact-card-value">vimlesh.dev</div>
                </div>
                <v-icon size="16" class="ml-auto" color="#94a3b8">mdi-arrow-top-right</v-icon>
              </a>
            </div>

            <div class="contact-location mt-6">
              <v-icon size="16" class="mr-2" color="#06b6d4">mdi-map-marker-outline</v-icon>
              <span>Gandhinagar, Gujarat · +91-8130684131</span>
            </div>
          </div>
        </div>
      </v-dialog>
    </v-container>
  </v-footer>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      currentYear: new Date().getFullYear(),
      activeModal: '',
      techStack: [
        { name: 'Vue 3', icon: 'mdi-vuejs' },
        { name: 'Node.js', icon: 'mdi-nodejs' },
        { name: 'MySQL', icon: 'mdi-database' },
        { name: 'Vuetify', icon: 'mdi-palette-swatch' },
        { name: 'Express', icon: 'mdi-server' },
        { name: 'Railway', icon: 'mdi-train' },
        { name: 'Aiven', icon: 'mdi-cloud-check' },
        { name: 'Valkey', icon: 'mdi-lightning-bolt-outline' },
        { name: 'Vite', icon: 'mdi-lightning-bolt' },
      ],
      stats: [
        { value: '9+', label: 'Course Categories' },
        { value: 'AI', label: 'Powered Support' },
        { value: 'Full Stack', label: 'Architecture' },
        { value: '100%', label: 'Responsive' },
      ]
    }
  },
  computed: {
    ...mapGetters(['category']),
    showPrivacy: {
      get() { return this.activeModal === 'privacy' },
      set(v) { if (!v) this.activeModal = '' }
    },
    showTerms: {
      get() { return this.activeModal === 'terms' },
      set(v) { if (!v) this.activeModal = '' }
    },
    showContact: {
      get() { return this.activeModal === 'contact' },
      set(v) { if (!v) this.activeModal = '' }
    }
  },
  methods: {
    handleCategorySelect(category) {
      this.$router.push({ path: '/courses/all', query: { category } })
    }
  }
}
</script>

<style scoped>
.footer-shell {
  background: transparent;
  color: var(--text-main);
}

/* ── Decorative top divider ─────────────────── */
.footer-divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--brand-1), var(--brand-2), var(--brand-3), transparent);
  opacity: 0.4;
  border-radius: 2px;
}

/* ── Main panel ─────────────────────────────── */
.footer-panel {
  border-radius: var(--r-xl);
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  color: var(--text-main);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.footer-panel::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.06), transparent 70%);
  pointer-events: none;
}

.footer-panel::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.05), transparent 70%);
  pointer-events: none;
}

/* ── Brand ──────────────────────────────────── */
.footer-brand-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--grad-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
}

.footer-brand {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.footer-tagline {
  font-size: 0.78rem;
  color: var(--text-soft);
  font-weight: 500;
  letter-spacing: 0.02em;
}

.footer-copy {
  color: var(--text-soft);
  line-height: 1.7;
  font-size: 0.92rem;
}

/* ── Developer card ─────────────────────────── */
.dev-card {
  border-radius: var(--r-md);
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.06), rgba(6, 182, 212, 0.04));
  border: 1px solid var(--glass-border);
  position: relative;
  overflow: hidden;
}

.dev-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--grad-primary);
}

.dev-card-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-faint);
  font-weight: 700;
  display: flex;
  align-items: center;
}

.dev-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-strong);
}

.dev-role {
  font-size: 0.85rem;
  color: var(--brand-2);
  font-weight: 600;
}

/* ── Social buttons ─────────────────────────── */
.social-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-soft);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.social-btn:hover {
  background: var(--grad-primary);
  color: #fff;
  border-color: transparent;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3);
}

/* ── Navigation links ───────────────────────── */
.footer-heading {
  margin-bottom: 18px;
  font-weight: 800;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-strong);
  position: relative;
  padding-left: 12px;
}

.footer-heading::before {
  content: '';
  position: absolute;
  left: 0;
  top: 2px;
  bottom: 2px;
  width: 3px;
  border-radius: 3px;
  background: var(--grad-primary);
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-link {
  color: var(--text-soft);
  text-align: left;
  background: transparent;
  border: 0;
  padding: 6px 0;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.footer-link:hover {
  color: var(--brand-2);
  transform: translateX(6px);
}

/* ── Tech badges ────────────────────────────── */
.tech-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: var(--r-pill);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-main);
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(6, 182, 212, 0.06));
  border: 1px solid var(--glass-border);
  transition: all 0.25s ease;
  cursor: default;
}

.tech-badge:hover {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.16), rgba(6, 182, 212, 0.12));
  border-color: var(--brand-2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

/* ── Category chips ─────────────────────────── */
.footer-chip {
  color: var(--text-main) !important;
  border-color: var(--glass-border) !important;
  font-weight: 600;
  font-size: 0.78rem;
  transition: all 0.2s ease;
}

.footer-chip:hover {
  color: var(--brand-2) !important;
  border-color: var(--brand-2) !important;
  transform: translateY(-2px);
}

/* ── Stats bar ──────────────────────────────── */
.stats-bar {
  border-radius: var(--r-lg);
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.06), rgba(99, 102, 241, 0.04), rgba(6, 182, 212, 0.06));
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px);
}

.stat-value {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  background: var(--grad-text);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.78rem;
  color: var(--text-soft);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Bottom bar ─────────────────────────────── */
.bottom-bar {
  border-top: 1px solid var(--glass-border);
  padding-top: 24px;
}

.bottom-text {
  font-size: 0.82rem;
  color: var(--text-soft);
  font-weight: 500;
}

.bottom-link {
  background: transparent;
  border: 0;
  color: var(--text-faint);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.bottom-link:hover {
  color: var(--brand-2);
}

/* ── Pulse dot animation ────────────────────── */
.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
  70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

/* ── Heart beat animation ───────────────────── */
.heart-beat {
  animation: heartbeat 1.4s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  14% { transform: scale(1.2); }
  28% { transform: scale(1); }
  42% { transform: scale(1.15); }
  56% { transform: scale(1); }
}

/* ── Modal shells ───────────────────────────── */
.modal-shell {
  background: var(--surface);
  border-radius: var(--r-xl);
  color: var(--text-main);
  max-height: 85vh;
  overflow-y: auto;
}

.modal-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-icon--purple { background: linear-gradient(135deg, #7c3aed, #6366f1); }
.modal-icon--blue { background: linear-gradient(135deg, #6366f1, #06b6d4); }
.modal-icon--cyan { background: linear-gradient(135deg, #06b6d4, #22d3ee); }

.modal-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-strong);
  letter-spacing: -0.02em;
}

.modal-body p {
  color: var(--text-soft);
  line-height: 1.75;
  font-size: 0.92rem;
  margin-bottom: 12px;
}

.modal-section-label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-faint);
  font-weight: 700;
  margin-bottom: 20px !important;
}

.modal-heading {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-strong);
  margin-top: 20px;
  margin-bottom: 8px;
}

.modal-contact-strip {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  border-radius: var(--r-sm);
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.06), rgba(6, 182, 212, 0.04));
  border: 1px solid var(--glass-border);
  font-size: 0.85rem;
  color: var(--text-soft);
}

/* ── Contact cards ──────────────────────────── */
.contact-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: var(--r-md);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  text-decoration: none;
  color: var(--text-main);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.contact-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--brand-2);
}

.contact-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.contact-card-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-faint);
  font-weight: 700;
  margin-bottom: 2px;
}

.contact-card-value {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-strong);
}

.contact-location {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: var(--text-soft);
  font-weight: 500;
}

/* ── Responsive ─────────────────────────────── */
@media (max-width: 600px) {
  .footer-panel {
    padding: 24px 20px !important;
  }
  .stats-bar {
    padding: 20px 12px !important;
  }
  .stat-value {
    font-size: 1.2rem;
  }
  .modal-shell {
    padding: 24px 20px !important;
    border-radius: var(--r-lg);
  }
}
</style>
