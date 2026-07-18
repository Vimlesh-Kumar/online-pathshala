<template>
  <v-btn icon variant="text" class="wishlist-button">
    <v-icon
      v-if="!wishlistCoursesId.includes(course_id)"
      color="error"
      @click="addToWishlist(course_id)"
    >
      mdi-heart-outline
    </v-icon>
    <v-icon
      v-else
      color="error"
      @click="removeFromWishlist(course_id)"
    >
      mdi-heart
    </v-icon>
  </v-btn>
</template>

<script>
import { mapState } from 'vuex'
import { toast } from '@/plugins/toast'

export default {
  props: ['course_id', 'user'],
  computed: {
    ...mapState(['wishlistCourses']),
    wishlistCoursesId() {
      return this.wishlistCourses ? this.wishlistCourses.map((w) => w.id) : []
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

<style scoped>
.wishlist-button {
  color: #b42318;
}
</style>
