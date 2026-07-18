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
        <v-col cols="12" md="2" class="d-flex ga-2">
          <v-btn
            variant="tonal"
            rounded="pill"
            class="flex-grow-1"
            @click="showMoreFilters = !showMoreFilters"
          >
            <v-icon start size="18">mdi-tune-variant</v-icon> Filters
            <v-badge v-if="activeFilterCount" :content="activeFilterCount" color="primary" inline class="ml-1" />
          </v-btn>
          <v-btn variant="outlined" rounded="pill" @click="resetFilters">Reset</v-btn>
        </v-col>
      </v-row>

      <!-- Price / rating filters -->
      <v-expand-transition>
        <div v-if="showMoreFilters" class="more-filters pa-4 mb-2">
          <v-row align="center">
            <v-col cols="12" md="6">
              <div class="text-body-2 font-weight-bold mb-2">
                Price range: ₹{{ priceRange[0] }} – ₹{{ priceRange[1] }}
              </div>
              <v-range-slider
                v-model="priceRange"
                :min="0"
                :max="5000"
                :step="100"
                color="primary"
                hide-details
                @end="handlePriceChange"
              />
            </v-col>
            <v-col cols="12" md="4">
              <div class="text-body-2 font-weight-bold mb-2">Minimum rating</div>
              <v-rating
                v-model="minRating"
                color="warning"
                active-color="warning"
                hover
                size="26"
                @update:model-value="handleRatingChange"
              />
            </v-col>
            <v-col cols="12" md="2" class="d-flex justify-md-end">
              <v-btn v-if="minRating" size="small" variant="text" @click="minRating = 0; handleRatingChange()">
                Clear rating
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>

      <div class="d-flex flex-wrap align-center justify-space-between mb-6 mt-4 px-1">
        <div class="text-body-1 font-weight-bold">{{ resultsCount }} results</div>
        <div class="text-body-2 text-medium-emphasis">Page {{ page }} of {{ totalPages || 1 }}</div>
      </div>

      <template v-if="loading">
        <all-courses :all-courses="[]" :loading="true" />
      </template>

      <template v-else-if="courses.length > 0">
        <all-courses :all-courses="courses" />
        <div class="d-flex justify-center mt-10">
          <v-pagination
            v-model="page"
            :length="totalPages || 1"
            :total-visible="totalVisiblePages"
            rounded="circle"
            color="primary"
            density="comfortable"
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
      localCategory: 'All',
      showMoreFilters: false,
      priceRange: [0, 5000],
      minRating: 0
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
    },
    // Cap how many page numbers v-pagination renders — without this it
    // renders one button per page (800+ with the 10,000-course catalog),
    // overflowing the layout. Vuetify collapses the rest into "…" for us.
    totalVisiblePages() {
      return this.$vuetify.display.mobile ? 5 : 7
    },
    activeFilterCount() {
      let n = 0
      if (this.priceRange[0] > 0 || this.priceRange[1] < 5000) n += 1
      if (this.minRating > 0) n += 1
      return n
    }
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler(newVal) {
        this.localSearchQuery = newVal.q || ''
        this.localCategory = newVal.category || 'All'
        this.priceRange = [Number(newVal.minPrice) || 0, Number(newVal.maxPrice) || 5000]
        this.minRating = Number(newVal.minRating) || 0
        if (this.activeFilterCount) this.showMoreFilters = true
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
        if (this.priceRange[0] > 0) params.minPrice = this.priceRange[0]
        if (this.priceRange[1] < 5000) params.maxPrice = this.priceRange[1]
        if (this.minRating > 0) params.minRating = this.minRating

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
    handlePriceChange() {
      const query = { ...this.$route.query }
      if (this.priceRange[0] > 0) query.minPrice = this.priceRange[0]
      else delete query.minPrice
      if (this.priceRange[1] < 5000) query.maxPrice = this.priceRange[1]
      else delete query.maxPrice
      this.$router.push({ path: '/courses/all', query })
    },
    handleRatingChange() {
      const query = { ...this.$route.query }
      if (this.minRating > 0) query.minRating = this.minRating
      else delete query.minRating
      this.$router.push({ path: '/courses/all', query })
    },
    resetFilters() {
      this.localSearchQuery = ''
      this.localCategory = 'All'
      this.sortBy = 'Newest'
      this.priceRange = [0, 5000]
      this.minRating = 0
      this.showMoreFilters = false
      this.page = 1
      this.$router.push({ path: '/courses/all', query: {} })
    }
  }
}
</script>

<style scoped>
.filter-select :deep(.v-field) {
  background: var(--glass-bg);
  border-radius: 999px;
}

.more-filters {
  background: var(--grad-primary-soft);
  border: 1px solid var(--glass-border);
  border-radius: var(--r-md);
}
</style>
