<template>
  <v-row>
    <v-col v-for="course in allCourses" :key="course.id" cols="12" sm="6" lg="4" xl="3">
      <v-card class="course-card section-card h-100" flat @click="handleOnCourseClick(course)">
        <div class="course-media">
          <v-img cover height="220" :src="course.thumb_url"></v-img>
          <v-chip size="small" rounded="pill" color="white" class="course-chip">
            {{ course.category || 'Course' }}
          </v-chip>
        </div>

        <v-card-text class="pa-5">
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="course-author">{{ course.author }}</span>
            <span class="course-stats">{{ course.enrolled_students || 0 }} learners</span>
          </div>

          <h3 class="course-title line-clamp-2">{{ course.title }}</h3>
          <p class="course-subtitle line-clamp-3 mt-3">{{ course.subtitle }}</p>

          <div class="d-flex align-center mt-4">
            <v-rating
              :model-value="Number(course.rating || 4.5)"
              color="warning"
              density="compact"
              half-increments
              readonly
              size="small"
            />
            <span class="ml-2 text-body-2 font-weight-bold">{{ course.rating || 4.5 }}</span>
          </div>

          <div class="d-flex align-center justify-space-between mt-6">
            <div>
              <div class="course-price">₹{{ course.price }}</div>
              <div class="course-meta">Wishlist {{ course.wishlist_count || 0 }}</div>
            </div>
            <v-btn color="primary" rounded="pill" class="px-4">
              View course
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    allCourses: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    handleOnCourseClick(course) {
      this.$store.dispatch('getACourse', course)
      this.$router.push(`/course/${course.id}`)
    }
  }
}
</script>

<style scoped>
.course-card {
  cursor: pointer;
  overflow: hidden;
  border-radius: 28px;
  background: rgba(255, 253, 248, 0.92);
  border: 1px solid rgba(31, 41, 55, 0.08);
  box-shadow: 0 20px 44px rgba(20, 33, 61, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.course-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 28px 56px rgba(20, 33, 61, 0.12);
}

.course-media {
  position: relative;
}

.course-chip {
  position: absolute;
  top: 16px;
  left: 16px;
  font-weight: 700;
  color: #14213d;
}

.course-author,
.course-stats,
.course-meta {
  color: #6b7280;
  font-size: 0.86rem;
}

.course-title {
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1.25;
  color: #14213d;
}

.course-subtitle {
  min-height: 68px;
  color: #5b6472;
  line-height: 1.6;
}

.course-price {
  font-size: 1.35rem;
  font-weight: 900;
  color: #14213d;
}
</style>
