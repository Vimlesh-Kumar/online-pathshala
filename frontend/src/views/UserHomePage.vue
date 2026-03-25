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
        <v-btn
          v-if="user.user_role === 'Tutor'"
          color="primary"
          rounded="pill"
          class="mt-4 mt-md-0"
          @click="$router.push('/user/tutor/add-course')"
        >
          Add new course
        </v-btn>
      </div>

      <all-courses v-if="userCourses.length" :all-courses="userCourses" />

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
