<template>
  <v-container class="app-section">
    <section class="page-intro pa-6 pa-md-10">
      <v-row align="center">
        <v-col cols="12" md="7">
          <div class="eyebrow mb-5">Modern Learning Marketplace</div>
          <h1 class="hero-title mb-5">Learn job-ready skills through courses that feel curated, not crowded.</h1>
          <p class="app-section-copy hero-copy mb-8">
            Browse practical courses, save what matters, and build your roadmap with a cleaner learning experience inspired by leading course platforms.
          </p>

          <div class="d-flex flex-wrap ga-4 mb-8">
            <v-btn color="primary" rounded="pill" size="large" class="px-6" @click="$router.push('/courses/all')">
              Explore all courses
            </v-btn>
            <v-btn variant="outlined" rounded="pill" size="large" class="px-6" @click="$router.push('/user/sign-up')">
              Create free account
            </v-btn>
          </div>

          <div class="d-flex flex-wrap ga-4">
            <div v-for="stat in stats" :key="stat.label" class="metric-pill px-5 py-4">
              <div class="text-h5 font-weight-black">{{ stat.value }}</div>
              <div class="text-body-2 text-medium-emphasis">{{ stat.label }}</div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="5">
          <v-card class="hero-card section-card" flat>
            <v-img src="../assets/homepage2.jpg" height="380" cover />
            <v-card-text class="pa-6">
              <div class="d-flex align-center justify-space-between mb-3">
                <span class="eyebrow">Featured Path</span>
                <span class="text-body-2 text-medium-emphasis">Weekly focus</span>
              </div>
              <h3 class="text-h5 font-weight-bold mb-2">Development to deployment</h3>
              <p class="app-section-copy mb-0">
                Start with programming fundamentals, move into real projects, and keep track of the courses you want to finish next.
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </section>

    <section class="mt-10">
      <div class="d-flex flex-column flex-md-row align-md-end justify-space-between mb-6">
        <div>
          <div class="eyebrow mb-3">Featured Courses</div>
          <h2 class="app-section-title">Start with the strongest picks</h2>
          <p class="app-section-copy mt-3 mb-0">Top-rated courses from the current catalog, ready for discovery.</p>
        </div>
        <v-btn variant="text" color="primary" class="mt-4 mt-md-0" @click="$router.push('/courses/all')">
          Browse full catalog
        </v-btn>
      </div>

      <all-courses :all-courses="allCourses.slice(0, 8)" />
    </section>

    <section class="mt-12">
      <v-row>
        <v-col v-for="feature in features" :key="feature.title" cols="12" md="4">
          <v-card class="glass-panel section-card h-100 pa-6" flat>
            <v-avatar size="56" color="primary" class="mb-4">
              <v-icon color="white">{{ feature.icon }}</v-icon>
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-3">{{ feature.title }}</h3>
            <p class="app-section-copy mb-0">{{ feature.desc }}</p>
          </v-card>
        </v-col>
      </v-row>
    </section>
  </v-container>
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
        { value: '4.5+', label: 'Average course rating' }
      ],
      features: [
        { title: 'Focused discovery', desc: 'Browse featured and filtered courses without noisy layouts or inconsistent cards.', icon: 'mdi-compass-outline' },
        { title: 'Clear progress flow', desc: 'The catalog, detail pages, cart, and wishlist now follow the same structure and spacing.', icon: 'mdi-view-dashboard-outline' },
        { title: 'Tutor-friendly setup', desc: 'Instructors can add and organize courses inside the same visual system as learners.', icon: 'mdi-account-tie-outline' }
      ]
    }
  },
  computed: {
    ...mapGetters(['allCourses'])
  },
  created() {
    this.$store.dispatch('fetchingFeaturedCourses')
    this.$store.dispatch('fetchingUser')
    this.$store.dispatch('getCartCourses')
  }
}
</script>

<style scoped>
.hero-title {
  font-size: clamp(2.4rem, 5vw, 4.7rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
  font-weight: 900;
  color: #14213d;
  max-width: 11ch;
}

.hero-copy {
  max-width: 58ch;
}

.hero-card {
  overflow: hidden;
  border-radius: 30px;
  background: rgba(255, 253, 248, 0.95);
  border: 1px solid rgba(31, 41, 55, 0.08);
  box-shadow: 0 26px 56px rgba(20, 33, 61, 0.12);
}
</style>
