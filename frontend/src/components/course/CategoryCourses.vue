<template>
  <v-container class="app-section">
    <section class="page-intro pa-6 pa-md-10 mb-8">
      <div class="eyebrow mb-4">Course Catalog</div>
      <h1 class="app-section-title mb-3">{{ title }}</h1>
      <p class="app-section-copy mb-0">Use search, category, and sorting controls to narrow the catalog without leaving the page.</p>
    </section>

    <section class="glass-panel section-card pa-4 pa-md-6">
      <v-row class="mb-2" align="center">
        <v-col cols="12" md="5">
          <v-text-field
            class="search-input"
            v-model="localSearchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Search courses"
            variant="solo-filled"
            flat
            hide-details
            rounded="pill"
            @keyup.enter="handleLocalSearch"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            class="filter-select"
            v-model="localCategory"
            :items="['All', ...category]"
            label="Category"
            variant="solo-filled"
            flat
            hide-details
            rounded="pill"
            @update:model-value="handleCategoryChange"
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-select
            class="filter-select"
            v-model="sortBy"
            :items="sortOptions"
            label="Sort"
            variant="solo-filled"
            flat
            hide-details
            rounded="pill"
            @update:model-value="handleSortChange"
          />
        </v-col>
        <v-col cols="12" md="2" class="d-flex justify-md-end">
          <v-btn variant="outlined" rounded="pill" class="w-100 w-md-auto" @click="resetFilters">Reset</v-btn>
        </v-col>
      </v-row>

      <div class="d-flex flex-wrap align-center justify-space-between mb-6 mt-4 px-1">
        <div class="text-body-1 font-weight-bold">{{ resultsCount }} results</div>
        <div class="text-body-2 text-medium-emphasis">Page {{ page }} of {{ totalPages || 1 }}</div>
      </div>

      <template v-if="loading">
        <v-row>
          <v-col v-for="n in 8" :key="n" cols="12" sm="6" lg="4" xl="3">
            <v-skeleton-loader type="card" class="rounded-xl" />
          </v-col>
        </v-row>
      </template>

      <template v-else-if="courses.length > 0">
        <all-courses :all-courses="courses" />
        <div class="d-flex justify-center mt-10">
          <v-pagination
            v-model="page"
            :length="totalPages || 1"
            rounded="circle"
            color="primary"
            @update:model-value="fetchCourses"
          />
        </div>
      </template>

      <v-card v-else class="section-card pa-8 text-center mt-4" flat>
        <v-icon size="60" color="primary" class="mb-4">mdi-magnify-remove-outline</v-icon>
        <h2 class="text-h5 font-weight-bold mb-3">No courses matched your filters.</h2>
        <p class="app-section-copy mb-6">Try a broader search or switch to another category.</p>
        <v-btn color="primary" rounded="pill" @click="resetFilters">Clear filters</v-btn>
      </v-card>
    </section>
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
      pageSize: 12,
      total: 0,
      localSearchQuery: '',
      localCategory: 'All'
    }
  },
  computed: {
    ...mapGetters(['category']),
    title() {
      if (this.localCategory !== 'All') return `${this.localCategory} courses`
      if (this.localSearchQuery) return `Results for "${this.localSearchQuery}"`
      return 'Browse all courses'
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
        const params = {
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
        this.courses = response.data.data || []
        this.total = response.data.meta?.total || 0
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
      this.$router.push({ path: '/courses/all', query: this.localSearchQuery ? { ...this.$route.query, q: this.localSearchQuery } : { ...this.$route.query } })
    },
    handleCategoryChange() {
      const query = { ...this.$route.query }
      if (this.localCategory === 'All') {
        delete query.category
      } else {
        query.category = this.localCategory
      }
      this.$router.push({ path: '/courses/all', query })
    },
    resetFilters() {
      this.localSearchQuery = ''
      this.localCategory = 'All'
      this.sortBy = 'Newest'
      this.page = 1
      this.$router.push({ path: '/courses/all', query: {} })
    }
  }
}
</script>

<style scoped>
.filter-select :deep(.v-field) {
  background: var(--search-bg);
  border-radius: 999px;
}
</style>
