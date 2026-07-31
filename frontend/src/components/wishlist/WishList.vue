<template>
  <button
    class="grid size-10 shrink-0 place-items-center rounded-full text-[#f43f5e] transition-colors hover:bg-[#f43f5e]/10"
    :aria-label="isWished ? 'Remove from wishlist' : 'Add to wishlist'"
    @click="isWished ? removeFromWishlist(course_id) : addToWishlist(course_id)"
  >
    <app-icon name="lucide:heart" size="20" :filled="isWished" />
  </button>
</template>

<script>
import { mapState } from 'vuex'
import { toast } from '@/plugins/toast'
import AppIcon from '@/components/ui/AppIcon.vue'

export default {
  components: { AppIcon },
  props: ['course_id', 'user'],
  computed: {
    ...mapState(['wishlistCourses']),
    wishlistCoursesId() {
      return this.wishlistCourses ? this.wishlistCourses.map((w) => w.id) : []
    },
    isWished() {
      return this.wishlistCoursesId.includes(this.course_id)
    }
  },
  methods: {
    /**
     * Save a course to the user's wishlist.
     */
    async addToWishlist(course_id) {
      if (!this.user) {
        this.$router.push('/user/sign-in')
        return
      }

      if (!this.wishlistCoursesId.includes(course_id)) {
        await this.$store.dispatch('addToWishlist', course_id)
        await this.$store.dispatch('getWishlistCourses')
        toast.success('Added to wishlist.')
      }
    },

    /**
     * Remove a course from the user's wishlist.
     */
    async removeFromWishlist(course_id) {
      await this.$store.dispatch('removeFromWishlist', course_id)
      await this.$store.dispatch('getWishlistCourses')
      toast.info('Removed from wishlist.')
    }
  }
}
</script>
