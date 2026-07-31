<template>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <template v-if="loading">
      <course-card-skeleton v-for="n in skeletonCount" :key="'sk' + n" />
    </template>
    <course-card
      v-for="course in allCourses"
      v-else
      :key="course.id"
      :course="course"
      @toggle-wishlist="handleWishlist"
    />
  </div>
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
