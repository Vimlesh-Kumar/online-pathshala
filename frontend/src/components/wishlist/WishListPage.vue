<template>
  <div class="mx-auto max-w-[1400px] px-4 pt-10 pb-14">
    <section class="page-intro mb-8 p-6 md:p-10">
      <div class="eyebrow mb-4">Wishlist</div>
      <h1 class="app-section-title mb-3">Saved for later</h1>
      <p class="text-muted-foreground">
        Keep interesting courses here and move them into your cart when you are ready.
      </p>
    </section>

    <div class="glass-panel section-card p-4 md:p-6">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="font-display text-2xl font-bold">Wishlist courses</h2>
        <span class="text-sm text-muted-foreground">{{ wishlistCourses.length }} saved</span>
      </div>

      <all-courses-vue v-if="wishlistCourses.length" :all-courses="wishlistCourses" />

      <div v-else class="section-card p-8 text-center">
        <app-icon name="lucide:heart-off" size="60" class="mx-auto mb-4 text-primary" />
        <h3 class="mb-3 font-display text-2xl font-bold">Your wishlist is empty.</h3>
        <p class="mb-6 text-muted-foreground">
          Explore the catalog and save courses that you want to revisit.
        </p>
        <button class="btn-brand mx-auto" @click="$router.push('/courses/all')">Explore courses</button>
      </div>
    </div>
  </div>
</template>

<script>
import AllCoursesVue from '../course/AllCourses.vue'
import { mapState } from 'vuex'
import AppIcon from '@/components/ui/AppIcon.vue'

export default {
  components: { AllCoursesVue, AppIcon },
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
