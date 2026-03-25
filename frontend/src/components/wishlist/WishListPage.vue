<template>
  <v-container class="app-section">
    <section class="page-intro pa-6 pa-md-10 mb-8">
      <div class="eyebrow mb-4">Wishlist</div>
      <h1 class="app-section-title mb-3">Saved for later</h1>
      <p class="app-section-copy mb-0">Keep interesting courses here and move them into your cart when you are ready.</p>
    </section>

    <v-card class="glass-panel section-card pa-4 pa-md-6" flat>
      <div class="d-flex align-center justify-space-between mb-6">
        <h2 class="text-h5 font-weight-bold">Wishlist courses</h2>
        <span class="text-body-2 text-medium-emphasis">{{ wishlistCourses.length }} saved</span>
      </div>

      <all-courses-vue v-if="wishlistCourses.length" :all-courses="wishlistCourses" />

      <v-card v-else class="section-card pa-8 text-center" flat>
        <v-icon size="60" color="primary" class="mb-4">mdi-heart-off-outline</v-icon>
        <h3 class="text-h5 font-weight-bold mb-3">Your wishlist is empty.</h3>
        <p class="app-section-copy mb-6">Explore the catalog and save courses that you want to revisit.</p>
        <v-btn color="primary" rounded="pill" @click="$router.push('/courses/all')">Explore courses</v-btn>
      </v-card>
    </v-card>
  </v-container>
</template>

<script>
import AllCoursesVue from '../course/AllCourses.vue'
import { mapState } from 'vuex'

export default {
  components: { AllCoursesVue },
  computed: {
    ...mapState(['wishlistCourses'])
  },
  created() {
    this.$store.dispatch('fetchingUser');
    this.$store.dispatch('getCartCourses');
    this.$store.dispatch('getWishlistCourses');
  },
}
</script>
