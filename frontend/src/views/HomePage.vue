<template>
  <div>
    <!-- ── Hero ─────────────────────────────────────── -->
    <v-container class="app-section">
      <section class="page-intro pa-6 pa-md-12">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="blob blob-3"></div>

        <v-row align="center" class="position-relative" style="z-index: 1">
          <v-col cols="12" md="7">
            <div class="eyebrow mb-6">✨ Modern Learning Marketplace</div>
            <h1 class="hero-title mb-5">
              Learn anything.<br />
              <span class="gradient-text">Beautifully.</span>
            </h1>
            <p class="app-section-copy hero-copy mb-8">
              Practical, job-ready courses with a clean player, progress tracking, and a catalog
              that actually feels good to browse. Learn at your pace — free to start.
            </p>

            <div class="d-flex flex-wrap ga-4 mb-10">
              <v-btn size="x-large" class="btn-gradient px-8" @click="$router.push('/courses/all')">
                Explore courses <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
              <v-btn size="x-large" variant="outlined" class="px-7 outline-btn" @click="$router.push('/user/sign-up')">
                Create free account
              </v-btn>
            </div>

            <div class="d-flex flex-wrap ga-8">
              <div v-for="stat in stats" :key="stat.label">
                <div class="stat-value gradient-text">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="5" class="d-none d-md-block">
            <div class="hero-visual">
              <v-card class="hero-card glass-panel" flat>
                <v-img src="../assets/homepage2.jpg" height="240" cover class="hero-card-img" />
                <v-card-text class="pa-6">
                  <div class="d-flex align-center justify-space-between mb-3">
                    <span class="eyebrow">Featured Path</span>
                    <span class="rating-badge"><v-icon size="15" color="warning">mdi-star</v-icon> 4.8</span>
                  </div>
                  <h3 class="text-h6 font-weight-bold mb-2">Dev to Deployment</h3>
                  <div class="progress-row mb-2">
                    <span>Progress</span><span class="font-weight-bold">68%</span>
                  </div>
                  <v-progress-linear model-value="68" color="primary" height="8" rounded />
                </v-card-text>
              </v-card>

              <div class="float-badge float-badge-1 glass-panel">
                <v-icon color="success">mdi-check-decagram</v-icon>
                <div><b>Certificate</b><br /><small>on completion</small></div>
              </div>
              <div class="float-badge float-badge-2 glass-panel">
                <v-icon color="accent">mdi-play-circle</v-icon>
                <div><b>HD Video</b><br /><small>lessons</small></div>
              </div>
            </div>
          </v-col>
        </v-row>
      </section>

      <!-- ── Category rail ──────────────────────────── -->
      <section class="mt-10">
        <div class="d-flex align-center flex-wrap ga-3">
          <span class="rail-label mr-2">Browse:</span>
          <v-chip
            v-for="cat in category"
            :key="cat"
            class="category-chip"
            variant="outlined"
            @click="goToCategory(cat)"
          >
            {{ cat }}
          </v-chip>
        </div>
      </section>

      <!-- ── Featured courses ───────────────────────── -->
      <section class="mt-10">
        <div class="d-flex flex-column flex-md-row align-md-end justify-space-between mb-7">
          <div>
            <div class="eyebrow mb-3">🔥 Featured Courses</div>
            <h2 class="app-section-title">Start with the strongest picks</h2>
            <p class="app-section-copy mt-3 mb-0">Top-rated courses from the catalog, ready to explore.</p>
          </div>
          <v-btn variant="text" color="primary" class="mt-4 mt-md-0 font-weight-bold" @click="$router.push('/courses/all')">
            Browse full catalog <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </div>

        <all-courses :all-courses="allCourses.slice(0, 8)" />
      </section>

      <!-- ── Feature band ───────────────────────────── -->
      <section class="mt-14">
        <v-row>
          <v-col v-for="feature in features" :key="feature.title" cols="12" md="4">
            <v-card class="glass-panel section-card h-100 pa-7 hover-lift" flat>
              <div class="feature-icon mb-5">
                <v-icon size="28" color="white">{{ feature.icon }}</v-icon>
              </div>
              <h3 class="text-h6 font-weight-bold mb-3">{{ feature.title }}</h3>
              <p class="app-section-copy mb-0">{{ feature.desc }}</p>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <!-- ── CTA band ───────────────────────────────── -->
      <section class="mt-14">
        <v-card class="cta-band pa-8 pa-md-12" flat>
          <v-row align="center">
            <v-col cols="12" md="8">
              <h2 class="cta-title mb-3">Ready to teach what you know?</h2>
              <p class="cta-copy mb-0">Publish a course, build your curriculum, and reach learners — all in one place.</p>
            </v-col>
            <v-col cols="12" md="4" class="d-flex justify-md-end">
              <v-btn size="x-large" class="cta-btn px-8" @click="$router.push('/user/tutor/add-course')">
                Become an instructor
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </section>
    </v-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AllCourses from '../components/course/AllCourses.vue'

export default {
  components: { AllCourses },
  data() {
    return {
      stats: [
        { value: '10k+', label: 'Active learners' },
        { value: '100+', label: 'Structured lessons' },
        { value: '4.8★', label: 'Average rating' }
      ],
      features: [
        { title: 'Focused discovery', desc: 'Browse featured and filtered courses in a clean, consistent catalog — no clutter.', icon: 'mdi-compass-outline' },
        { title: 'Track your progress', desc: 'A distraction-free player with lesson-by-lesson completion and resume-where-you-left-off.', icon: 'mdi-chart-line-variant' },
        { title: 'Learn & earn', desc: 'Finish a course, get an auto-generated certificate, and showcase what you achieved.', icon: 'mdi-certificate-outline' }
      ]
    }
  },
  computed: {
    ...mapGetters(['allCourses', 'category'])
  },
  created() {
    this.$store.dispatch('fetchingFeaturedCourses')
    this.$store.dispatch('fetchingUser')
    this.$store.dispatch('getCartCourses')
  },
  methods: {
    goToCategory(cat) {
      this.$store.dispatch('setSelectedCategory', cat)
      this.$router.push({ path: '/courses/all', query: { category: cat } })
    }
  }
}
</script>

<style scoped>
.hero-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(2.6rem, 5.5vw, 4.8rem);
  line-height: 1.02;
  letter-spacing: -0.04em;
  font-weight: 800;
  color: var(--text-strong);
}

.hero-copy {
  max-width: 54ch;
  font-size: 1.08rem;
}

.stat-value {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1;
}

.stat-label {
  color: var(--text-soft);
  font-size: 0.9rem;
  margin-top: 4px;
}

.outline-btn {
  border: 1.5px solid var(--glass-border);
  color: var(--text-strong);
  font-weight: 700;
}

/* Hero visual */
.hero-visual {
  position: relative;
  padding: 12px;
}

.hero-card {
  overflow: hidden;
  border-radius: var(--r-xl);
}

.hero-card-img {
  border-top-left-radius: var(--r-xl);
  border-top-right-radius: var(--r-xl);
}

.rating-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 800;
  color: var(--brand-amber);
}

.progress-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-soft);
}

.float-badge {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: var(--r-md);
  font-size: 0.8rem;
  line-height: 1.2;
  color: var(--text-main);
  box-shadow: var(--shadow-md);
  animation: float 10s ease-in-out infinite;
}
.float-badge small { color: var(--text-soft); }
.float-badge-1 { top: 4%; left: -6%; }
.float-badge-2 { bottom: 8%; right: -4%; animation-delay: -4s; }

/* Category rail */
.rail-label { color: var(--text-soft); font-weight: 700; }
.category-chip {
  font-weight: 600;
  border-color: var(--glass-border);
  transition: all 0.2s ease;
}
.category-chip:hover {
  background: var(--grad-primary) !important;
  color: #fff !important;
  border-color: transparent;
  transform: translateY(-2px);
}

/* Feature icon */
.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--r-md);
  display: grid;
  place-items: center;
  background: var(--grad-primary);
  box-shadow: var(--shadow-glow);
}

/* CTA band */
.cta-band {
  border-radius: var(--r-xl);
  background: var(--grad-primary);
  color: #fff;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}
.cta-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}
.cta-copy { opacity: 0.92; font-size: 1.05rem; max-width: 52ch; }
.cta-btn {
  background: #fff !important;
  color: var(--brand-1) !important;
  font-weight: 800;
}
</style>
