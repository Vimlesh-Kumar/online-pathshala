<template>
  <v-container>
    <v-row>
      <v-col v-for="course in allCourses" :key="course.id" cols="12" sm="6" md="4" lg="3">
        <v-hover v-slot="{ isHovering, props }">
          <v-card
            v-bind="props"
            :elevation="isHovering ? 8 : 2"
            class="course-card rounded-xl overflow-hidden transition-all bg-white"
            @click="handleOnCourseClick(course)"
          >
            <v-img cover height="180" :src="course.thumb_url" class="align-end">
              <v-chip
                v-if="course.category"
                size="small"
                color="primary"
                class="ma-2 font-weight-bold"
                elevation="2"
              >
                {{ course.category }}
              </v-chip>
            </v-img>

            <v-card-item class="pb-1">
              <v-card-title class="text-subtitle-1 font-weight-bold line-clamp-2" style="height: 3rem;">
                {{ course.title }}
              </v-card-title>
              <v-card-subtitle class="text-caption text-grey-darken-1 pt-1">
                {{ course.author }}
              </v-card-subtitle>
            </v-card-item>

            <v-card-text>
              <div class="d-flex align-center mb-4">
                <v-rating
                  :model-value="course.rating || 4.5"
                  color="amber-darken-2"
                  density="compact"
                  half-increments
                  readonly
                  size="x-small"
                ></v-rating>
                <span class="text-caption font-weight-bold text-amber-darken-4 ms-1">
                  {{ course.rating || 4.5 }}
                </span>
                <span class="text-caption text-grey ms-1">(1.2k)</span>
              </div>
              
              <div class="d-flex align-center justify-space-between">
                <div class="text-h6 font-weight-black text-grey-darken-4">
                  ₹{{ course.price }}
                </div>
                <v-btn icon size="small" variant="tonal" color="primary" class="rounded-lg">
                  <v-icon size="small">mdi-cart-plus</v-icon>
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: ['allCourses'],
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.course-card:hover {
  transform: translateY(-8px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.transition-all {
  transition: all 0.3s ease;
}
</style>