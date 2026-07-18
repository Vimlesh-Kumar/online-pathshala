<template>
  <v-row>
    <v-col v-for="course in allCourses" :key="course.id" cols="12" sm="6" lg="4" xl="3">
      <course-card :course="course" @toggle-wishlist="handleWishlist" />
    </v-col>
  </v-row>
</template>

<script>
import CourseCard from './CourseCard.vue'

export default {
  components: { CourseCard },
  props: {
    allCourses: {
      type: Array,
      default: () => []
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
