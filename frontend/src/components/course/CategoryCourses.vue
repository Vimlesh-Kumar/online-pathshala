<template>
  <v-container class="mt-8">
    <v-row class="mb-6" align="center">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="localSearchQuery"
          prepend-inner-icon="mdi-magnify"
          label="Search courses..."
          variant="outlined"
          density="comfortable"
          hide-details
          rounded="lg"
          @keyup.enter="handleLocalSearch"
          class="bg-white"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="localCategory"
          :items="['All', ...category]"
          label="Category"
          variant="outlined"
          density="comfortable"
          hide-details
          rounded="lg"
          class="bg-white"
          @update:model-value="handleCategoryChange"
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="sortBy"
          :items="sortOptions"
          label="Sort by"
          variant="outlined"
          density="comfortable"
          hide-details
          rounded="lg"
          class="bg-white"
          @update:model-value="handleSortChange"
        ></v-select>
      </v-col>
    </v-row>

    <v-divider class="mb-8"></v-divider>

    <template v-if="loading">
      <v-row>
        <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3">
          <v-skeleton-loader type="card" class="rounded-xl"></v-skeleton-loader>
        </v-col>
      </v-row>
    </template>

    <template v-else-if="courses.length > 0">
      <all-courses :all-courses="courses"></all-courses>
      
      <!-- Pagination -->
      <div class="d-flex justify-center mt-12 pb-8">
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="7"
          rounded="lg"
          @update:model-value="fetchCourses"
          color="primary"
          elevation="1"
        ></v-pagination>
      </div>
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
import { mapGetters } from 'vuex'
import AllCourses from './AllCourses.vue'
import axios from 'axios'

export default {
  components: { AllCourses },
  data() {
    return {
      courses: [],
      loading: true,
      sortBy: 'Newest',
      sortOptions: ['Newest', 'Price: Low to High', 'Price: High to Low', 'Best Rating'],
      page: 1,
      pageSize: 20,
      total: 0,
      localSearchQuery: '',
      localCategory: 'All'
    }
  },
  computed: {
    ...mapGetters(['category']),
    title() {
      if (this.localCategory !== 'All') return `Courses in ${this.localCategory}`
      if (this.localSearchQuery) return `Search results for "${this.localSearchQuery}"`
      return 'All Courses'
    },
    resultsCount() {
      return this.total
    },
    totalPages() {
      return Math.ceil(this.total / this.pageSize)
    }
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler(newVal) {
        this.localSearchQuery = newVal.q || ''
        this.localCategory = newVal.category || 'All'
        this.page = 1
        this.fetchCourses()
      }
    }
  },
  methods: {
    async fetchCourses() {
      this.loading = true
      try {
        let url = '/courses'
        let params = {
          page: this.page,
          limit: this.pageSize,
          sortBy: this.sortBy
        }

        if (this.localCategory !== 'All') {
          url = `/courses/category/${this.localCategory}`
        } else if (this.localSearchQuery) {
          url = `/courses/search`
          params.q = this.localSearchQuery
        }
        
        const response = await axios.get(url, { params })
        this.courses = response.data.courses || []
        this.total = response.data.total || 0
      } catch (error) {
        console.error('Error fetching courses:', error)
        this.courses = []
        this.total = 0
      } finally {
        this.loading = false
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    },
    handleSortChange() {
      this.page = 1
      this.fetchCourses()
    },
    handleLocalSearch() {
      this.$router.push({ query: { ...this.$route.query, q: this.localSearchQuery } })
    },
    handleCategoryChange() {
      if (this.localCategory === 'All') {
        const query = { ...this.$route.query }
        delete query.category
        this.$router.push({ query })
      } else {
        this.$router.push({ query: { ...this.$route.query, category: this.localCategory } })
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