<template>
  <div class="mx-auto max-w-[1400px] px-4 pt-10 pb-14">
    <section class="page-intro mb-6 p-6 md:px-10 md:py-8">
      <div class="eyebrow mb-4">Course Catalog</div>
      <h1 class="app-section-title mb-3">{{ title }}</h1>
      <p class="text-muted-foreground">
        Use search, category, and sorting controls to narrow the catalog without leaving the page.
      </p>
    </section>

    <!-- Toolbar sticks under the header so filters stay reachable while scrolling. -->
    <section
      class="sticky top-24 z-30 mb-6 rounded-3xl border border-black/5 bg-background/80 p-3 backdrop-blur-xl md:p-4 dark:border-white/10 dark:bg-[#0e1626]/80"
    >
      <div class="grid items-center gap-3 md:grid-cols-12">
        <div class="relative flex items-center md:col-span-5">
          <app-icon
            name="lucide:search"
            size="18"
            class="pointer-events-none absolute left-4 text-muted-foreground"
          />
          <input
            v-model="localSearchQuery"
            type="search"
            aria-label="Search courses"
            placeholder="Search courses"
            class="h-12 w-full rounded-full border border-black/10 bg-foreground/[0.04] pr-4 pl-11 outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-3 focus:ring-primary/20 dark:border-white/10"
            @keyup.enter="handleLocalSearch"
          />
        </div>

        <div class="md:col-span-3">
          <select-root v-model="localCategory" @update:model-value="handleCategoryChange">
            <select-trigger class="h-12 w-full rounded-full" aria-label="Category">
              <select-value placeholder="Category" />
            </select-trigger>
            <select-content class="rounded-2xl">
              <select-item v-for="cat in ['All', ...category]" :key="cat" :value="cat">{{ cat }}</select-item>
            </select-content>
          </select-root>
        </div>

        <div class="md:col-span-2">
          <select-root v-model="sortBy" @update:model-value="handleSortChange">
            <select-trigger class="h-12 w-full rounded-full" aria-label="Sort">
              <select-value placeholder="Sort" />
            </select-trigger>
            <select-content class="rounded-2xl">
              <select-item v-for="option in sortOptions" :key="option" :value="option">
                {{ option }}
              </select-item>
            </select-content>
          </select-root>
        </div>

        <div class="flex gap-2 md:col-span-2">
          <button
            class="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary/12 px-4 py-3 font-semibold text-primary transition-colors hover:bg-primary/20"
            @click="showMoreFilters = !showMoreFilters"
          >
            <app-icon name="lucide:sliders-horizontal" size="18" /> Filters
            <span
              v-if="activeFilterCount"
              class="grid size-5 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
            >
              {{ activeFilterCount }}
            </span>
          </button>
          <button
            class="rounded-full border border-black/10 px-4 py-3 font-semibold transition-colors hover:border-primary/50 dark:border-white/15"
            @click="resetFilters"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Price / rating filters -->
      <transition name="filters-expand">
        <div
          v-if="showMoreFilters"
          class="mt-4 grid items-center gap-6 rounded-[18px] border border-black/5 bg-primary/5 p-4 md:grid-cols-12 dark:border-white/10"
        >
          <div class="md:col-span-6">
            <div class="mb-3 text-sm font-bold">
              Price range: ₹{{ priceRange[0] }} – ₹{{ priceRange[1] }}
            </div>
            <slider
              v-model="priceRange"
              :min="0"
              :max="5000"
              :step="100"
              @value-commit="handlePriceChange"
            />
          </div>
          <div class="md:col-span-4">
            <div class="mb-3 text-sm font-bold">Minimum rating</div>
            <star-rating
              :model-value="minRating"
              :size="26"
              :readonly="false"
              @update:model-value="handleRatingChange"
            />
          </div>
          <div class="flex md:col-span-2 md:justify-end">
            <button
              v-if="minRating"
              class="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              @click="handleRatingChange(0)"
            >
              Clear rating
            </button>
          </div>
        </div>
      </transition>
    </section>

    <!-- Results grid sits directly on the page: wrapping it in a second glass
         panel nested the surfaces and made the layout read as boxy. -->
    <section>
      <div class="mb-5 flex flex-wrap items-center justify-between gap-2 px-1">
        <div class="font-bold">
          {{ resultsCount.toLocaleString('en-IN') }}
          <span class="font-normal text-muted-foreground">results</span>
        </div>
        <div class="text-sm text-muted-foreground">Page {{ page }} of {{ totalPages || 1 }}</div>
      </div>

      <all-courses v-if="loading" :all-courses="[]" :loading="true" />

      <template v-else-if="courses.length > 0">
        <all-courses :all-courses="courses" />

        <pagination
          v-slot="{ page: currentPage }"
          v-model:page="page"
          class="mt-10"
          :total="total"
          :items-per-page="pageSize"
          :sibling-count="siblingCount"
          show-edges
          @update:page="fetchCourses"
        >
          <pagination-content v-slot="{ items }">
            <pagination-first class="rounded-full" />
            <pagination-previous class="rounded-full" />

            <template v-for="(item, index) in items">
              <pagination-item
                v-if="item.type === 'page'"
                :key="index"
                :value="item.value"
                :is-active="item.value === currentPage"
                class="rounded-full"
              >
                {{ item.value }}
              </pagination-item>
              <pagination-ellipsis v-else :key="`e${index}`" />
            </template>

            <pagination-next class="rounded-full" />
            <pagination-last class="rounded-full" />
          </pagination-content>
        </pagination>
      </template>

      <div
        v-else
        class="rounded-3xl border border-black/5 bg-card p-12 text-center dark:border-white/10 dark:bg-white/[0.04]"
      >
        <app-icon name="lucide:search-x" size="60" class="mx-auto mb-4 text-primary" />
        <h2 class="mb-3 font-display text-2xl font-bold">No courses matched your filters.</h2>
        <p class="mb-6 text-muted-foreground">Try a broader search or switch to another category.</p>
        <button class="btn-brand mx-auto" @click="resetFilters">Clear filters</button>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { useMediaQuery } from '@vueuse/core'
import AllCourses from './AllCourses.vue'
import axios from 'axios'
import AppIcon from '@/components/ui/AppIcon.vue'
import StarRating from '@/components/ui/StarRating.vue'
import { Slider } from '@/components/ui/slider'
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

export default {
  components: {
    AllCourses,
    AppIcon,
    StarRating,
    Slider,
    SelectRoot,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationFirst,
    PaginationItem,
    PaginationLast,
    PaginationNext,
    PaginationPrevious
  },
  setup() {
    // Replaces Vuetify's `$vuetify.display.mobile`.
    return { isMobile: useMediaQuery('(max-width: 960px)') }
  },
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
    // Cap how many page numbers render — without this the 10,000-course
    // catalog would emit 800+ buttons. The rest collapse into "…".
    siblingCount() {
      return this.isMobile ? 1 : 2
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
    handleRatingChange(value) {
      this.minRating = Number(value) || 0
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
/* Stand-in for Vuetify's <v-expand-transition>. */
.filters-expand-enter-active,
.filters-expand-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
  overflow: hidden;
}
.filters-expand-enter-from,
.filters-expand-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
