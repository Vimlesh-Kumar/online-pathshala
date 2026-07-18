<template>
  <v-container class="app-section">
    <section class="page-intro pa-6 pa-md-10 mb-8">
      <div class="d-flex flex-column flex-md-row justify-space-between align-md-center ga-4">
        <div>
          <div class="eyebrow mb-4">Instructor Dashboard</div>
          <h1 class="app-section-title mb-2">Your teaching at a glance</h1>
          <p class="app-section-copy mb-0">Track enrollments, ratings, and revenue across your courses.</p>
        </div>
        <v-btn class="btn-gradient" size="large" @click="$router.push('/user/tutor/add-course')">
          <v-icon start>mdi-plus</v-icon> New course
        </v-btn>
      </div>
    </section>

    <div v-if="loading" class="text-center py-12"><v-progress-circular indeterminate color="primary" size="44" /></div>

    <template v-else>
      <!-- Stat tiles -->
      <v-row class="mb-4">
        <v-col v-for="tile in tiles" :key="tile.label" cols="12" sm="4">
          <v-card class="glass-panel section-card pa-6 hover-lift" flat>
            <div class="tile-icon mb-3"><v-icon color="white">{{ tile.icon }}</v-icon></div>
            <div class="tile-value gradient-text">{{ tile.value }}</div>
            <div class="tile-label">{{ tile.label }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Per-course breakdown -->
      <v-card class="glass-panel section-card pa-6" flat>
        <h2 class="text-h6 font-weight-bold mb-5">Course performance</h2>
        <div v-if="courses.length" class="d-flex flex-column ga-3">
          <div v-for="c in courses" :key="c.id" class="course-row" @click="$router.push(`/course/${c.id}`)">
            <v-img :src="c.thumb_url" width="96" height="60" cover class="rounded-lg flex-shrink-0" />
            <div class="flex-grow-1 mx-4">
              <div class="font-weight-bold line-clamp-1">{{ c.title }}</div>
              <div class="text-caption text-medium-emphasis">{{ c.category }}</div>
            </div>
            <div class="stat-cell">
              <div class="stat-num">{{ c.enrollments }}</div>
              <div class="stat-cap">learners</div>
            </div>
            <div class="stat-cell">
              <div class="stat-num"><v-icon size="16" color="warning">mdi-star</v-icon> {{ c.avg_rating.toFixed(1) }}</div>
              <div class="stat-cap">rating</div>
            </div>
            <div class="stat-cell">
              <div class="stat-num">₹{{ formatMoney(c.revenue) }}</div>
              <div class="stat-cap">revenue</div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-8">
          <v-icon size="52" color="primary" class="mb-3">mdi-school-outline</v-icon>
          <p class="app-section-copy mb-4">You haven't published any courses yet.</p>
          <v-btn class="btn-gradient" @click="$router.push('/user/tutor/add-course')">Create your first course</v-btn>
        </div>
      </v-card>
    </template>
  </v-container>
</template>

<script>
export default {
  name: 'InstructorDashboard',
  data() {
    return { loading: true, courses: [], totals: { courses: 0, enrollments: 0, revenue: 0 } }
  },
  computed: {
    tiles() {
      return [
        { label: 'Published courses', value: this.totals.courses, icon: 'mdi-bookshelf' },
        { label: 'Total enrollments', value: this.totals.enrollments, icon: 'mdi-account-group' },
        { label: 'Total revenue', value: `₹${this.formatMoney(this.totals.revenue)}`, icon: 'mdi-cash-multiple' },
      ]
    },
  },
  async created() {
    try {
      const data = await this.$store.dispatch('fetchTutorStats')
      this.courses = data.courses
      this.totals = data.totals
    } catch (e) {
      console.error(e)
    } finally {
      this.loading = false
    }
  },
  methods: {
    formatMoney(n) {
      return Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })
    },
  },
}
</script>

<style scoped>
.tile-icon {
  width: 48px; height: 48px; border-radius: var(--r-sm);
  display: grid; place-items: center;
  background: var(--grad-primary); box-shadow: var(--shadow-glow);
}
.tile-value { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 2.2rem; font-weight: 800; line-height: 1; }
.tile-label { color: var(--text-soft); margin-top: 4px; }

.course-row {
  display: flex; align-items: center;
  padding: 12px; border-radius: var(--r-md); cursor: pointer;
  border: 1px solid var(--glass-border); transition: background 0.15s ease;
}
.course-row:hover { background: var(--grad-primary-soft); }
.stat-cell { text-align: center; min-width: 84px; }
.stat-num { font-weight: 800; color: var(--text-strong); }
.stat-cap { font-size: 0.72rem; color: var(--text-soft); text-transform: uppercase; letter-spacing: 0.04em; }
</style>
