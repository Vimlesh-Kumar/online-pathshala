<template>
  <v-container class="mt-8">
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">{{ title }}</h1>
        <div class="text-subtitle-1 text-grey">{{ resultsCount }} results found</div>
      </div>
      <v-select
        v-model="sortBy"
        :items="sortOptions"
        label="Sort by"
        variant="outlined"
        density="compact"
        hide-details
        class="max-width-200"
      ></v-select>
    </div>

    <v-divider class="mb-8"></v-divider>

    <template v-if="loading">
      <v-row>
        <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3">
          <v-skeleton-loader type="card" class="rounded-xl"></v-skeleton-loader>
        </v-col>
      </v-row>
    </template>

    <template v-else-if="courses.length > 0">
      <all-courses :all-courses="sortedCourses"></all-courses>
    </template>

    <v-sheet v-else class="text-center py-16 px-4 rounded-xl" border>
      <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-magnify-remove</v-icon>
      <h2 class="text-h5 font-weight-bold mb-2">No results found</h2>
      <p class="text-grey mb-6">Try adjusting your search or category filter to find what you're looking for.</p>
      <v-btn color="primary" variant="flat" class="rounded-lg" @click="$router.push('/')">
        Go Home
      </v-btn>
    </v-sheet>
  </v-container>
</template>

<script>
import AllCourses from './AllCourses.vue'
import axios from 'axios'

export default {
  components: { AllCourses },
  data() {
    return {
      courses: [],
      loading: true,
      sortBy: 'Newest',
      sortOptions: ['Newest', 'Price: Low to High', 'Price: High to Low', 'Best Rating']
    }
  },
  computed: {
    title() {
      if (this.$route.query.category) return `Courses in ${this.$route.query.category}`
      if (this.$route.query.q) return `Search results for "${this.$route.query.q}"`
      return 'All Courses'
    },
    resultsCount() {
      return this.courses.length
    },
    sortedCourses() {
      let sorted = [...this.courses]
      if (this.sortBy === 'Price: Low to High') return sorted.sort((a, b) => a.price - b.price)
      if (this.sortBy === 'Price: High to Low') return sorted.sort((a, b) => b.price - a.price)
      if (this.sortBy === 'Best Rating') return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      return sorted // Default newest (assumes ID order for now)
    }
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler: 'fetchCourses'
    }
  },
  methods: {
    async fetchCourses() {
      this.loading = true
      try {
        let url = '/courses'
        if (this.$route.query.category) {
          url = `/courses/category/${this.$route.query.category}`
        } else if (this.$route.query.q) {
          url = `/courses/search?q=${this.$route.query.q}`
        }
        
        const response = await axios.get(url)
        this.courses = response.data.courses || []
      } catch (error) {
        console.error('Error fetching courses:', error)
        this.courses = []
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.max-width-200 {
  max-width: 200px;
}
</style>