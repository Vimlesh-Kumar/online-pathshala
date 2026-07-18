<template>
  <v-row>
    <template v-if="loading">
      <v-col v-for="n in skeletonCount" :key="'sk' + n" cols="12" sm="6" lg="4" xl="3">
        <course-card-skeleton />
      </v-col>
    </template>
    <v-col v-else v-for="course in allCourses" :key="course.id" cols="12" sm="6" lg="4" xl="3">
      <course-card :course="course" @toggle-wishlist="handleWishlist" />
    </v-col>
  </v-row>
</template>

<script>
import CourseCard from './CourseCard.vue'
import CourseCardSkeleton from './CourseCardSkeleton.vue'

export default {
  components: { CourseCard, CourseCardSkeleton },
  props: {
    allCourses: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    skeletonCount: {
      type: Number,
      default: 8
    }
  },
  emits: ['toggle-wishlist'],
  methods: {
    handleWishlist(course) {
      this.$emit('toggle-wishlist', course)
    }
  }
}
</script>
