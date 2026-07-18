<template>
  <v-container class="app-section">
    <section class="page-intro pa-6 pa-md-10 mb-10" v-if="user">
      <div class="eyebrow mb-4">{{ user.user_role === 'Student' ? 'My Learning' : 'Tutor Dashboard' }}</div>
      <h1 class="app-section-title mb-3">
        {{ user.user_role === 'Student' ? `Welcome back, ${user.full_name}` : `Manage your courses, ${user.full_name}` }}
      </h1>
      <p class="app-section-copy mb-0">
        {{ user.user_role === 'Student'
          ? 'Pick up where you left off, revisit saved courses, and keep your learning queue clean.'
          : 'Review your published catalog and jump back into course creation without leaving the main workflow.' }}
      </p>
    </section>

    <section v-if="user">
      <div class="d-flex flex-column flex-md-row align-md-end justify-space-between mb-6">
        <div>
          <div class="eyebrow mb-3">{{ user.user_role === 'Student' ? 'Enrolled Courses' : 'Your Courses' }}</div>
          <h2 class="app-section-title">
            {{ userCourses.length ? 'Your current library' : 'Nothing here yet' }}
          </h2>
        </div>
        <div v-if="user.user_role === 'Tutor'" class="d-flex ga-3 mt-4 mt-md-0">
          <v-btn variant="tonal" rounded="pill" @click="$router.push('/user/tutor/dashboard')">
            <v-icon start>mdi-chart-box-outline</v-icon> Dashboard
          </v-btn>
          <v-btn class="btn-gradient" @click="$router.push('/user/tutor/add-course')">Add new course</v-btn>
        </div>
      </div>

      <v-row v-if="userCourses.length">
        <v-col v-for="c in userCourses" :key="c.id" cols="12" sm="6" lg="4">
          <v-card class="glass-panel section-card overflow-hidden h-100 hover-lift" flat>
            <div class="learn-media">
              <v-img :src="c.thumb_url" height="150" cover />
              <span v-if="Number(c.progress) >= 100" class="done-badge">✓ Completed</span>
            </div>
            <v-card-text class="pa-5">
              <div class="eyebrow mb-2">{{ c.category }}</div>
              <h3 class="learn-title line-clamp-2 mb-3">{{ c.title }}</h3>

              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-caption text-medium-emphasis">
                  {{ c.completed_lessons || 0 }}/{{ c.total_lessons || 0 }} lessons
                </span>
                <span class="text-caption font-weight-bold">{{ Math.round(Number(c.progress) || 0) }}%</span>
              </div>
              <v-progress-linear :model-value="Number(c.progress) || 0" color="primary" height="7" rounded class="mb-4" />

              <v-btn block class="btn-gradient" @click="$router.push(`/learn/${c.id}`)">
                <v-icon start>mdi-play</v-icon>
                {{ Number(c.progress) > 0 ? 'Continue learning' : 'Start learning' }}
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card v-else class="glass-panel section-card pa-8 text-center" flat>
        <v-icon size="52" color="primary" class="mb-4">mdi-book-open-page-variant-outline</v-icon>
        <h3 class="text-h5 font-weight-bold mb-3">
          {{ user.user_role === 'Student' ? 'You have not enrolled in any course yet.' : 'You have not created any course yet.' }}
        </h3>
        <p class="app-section-copy mb-6">
          {{ user.user_role === 'Student'
            ? 'Start with featured courses and build your learning path.'
            : 'Create your first course to begin publishing learning content.' }}
        </p>
        <v-btn color="primary" rounded="pill" @click="$router.push('/courses/all')">Explore courses</v-btn>
      </v-card>
    </section>

    <section class="mt-12">
      <div class="eyebrow mb-3">Discover More</div>
      <h2 class="app-section-title mb-6">Expand your skillset</h2>
      <all-courses :all-courses="allCourses.slice(0, 8)" />
    </section>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import AllCourses from '../components/course/AllCourses.vue';

export default {
  components: { AllCourses },
  computed: {
    ...mapGetters(['user', 'allCourses', 'userCourses'])
  },
  async created() {
    await this.$store.dispatch('fetchingUser')
    await this.$store.dispatch('fetchingUserCourses')
    await this.$store.dispatch('fetchingFeaturedCourses')
  },
}
</script>

<style scoped>
.learn-media {
  position: relative;
}
.done-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  border-radius: var(--r-pill);
  background: var(--grad-primary);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  box-shadow: var(--shadow-sm);
}
.learn-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-strong);
  min-height: 2.6rem;
}
</style>
