<template>
  <transition name="palette-pop">
    <div v-if="open" class="palette-backdrop" @click.self="close">
      <div class="palette-panel glass-panel section-card">
        <div class="palette-input-row">
          <app-icon name="lucide:search" size="22" class="mr-2 text-primary" />
          <input
            id="command-palette-input"
            ref="input"
            v-model="query"
            class="palette-input"
            aria-label="Search courses or jump to a page"
            placeholder="Search courses or jump to a page…"
            @keydown.down.prevent="move(1)"
            @keydown.up.prevent="move(-1)"
            @keydown.enter.prevent="select(active)"
            @keydown.esc="close"
          />
          <span
            class="ml-2 rounded-full border border-black/10 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground dark:border-white/15"
          >
            Esc
          </span>
        </div>

        <div class="palette-results">
          <div v-if="searching && !courseResults.length" class="palette-empty">Searching…</div>
          <div v-else-if="!results.length" class="palette-empty">No matches — try a different keyword.</div>

          <template v-else>
            <div v-if="pageResults.length" class="palette-group-label">Pages</div>
            <div
              v-for="(r, i) in pageResults" :key="'p' + i"
              class="palette-row" :class="{ active: activeIndex(r) === active }"
              @mouseenter="activeIndex(r) !== -1 && (active = activeIndex(r))"
              @click="select(r)"
            >
              <app-icon :name="r.icon" size="18" class="mr-3 text-primary" />
              <span>{{ r.label }}</span>
            </div>

            <div v-if="courseResults.length" class="palette-group-label">Courses</div>
            <div
              v-for="(r, i) in courseResults" :key="'c' + i"
              class="palette-row" :class="{ active: activeIndex(r) === active }"
              @mouseenter="activeIndex(r) !== -1 && (active = activeIndex(r))"
              @click="select(r)"
            >
              <app-icon name="lucide:book-open" size="18" class="mr-3 text-primary" />
              <span class="line-clamp-1">{{ r.label }}</span>
              <span class="palette-sub ml-auto">{{ r.category }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import axios from 'axios'
import AppIcon from '@/components/ui/AppIcon.vue'

const STATIC_PAGES = [
  { label: 'Home', path: '/', icon: 'lucide:house' },
  { label: 'My Learning', path: '/user', icon: 'lucide:layout-dashboard' },
  { label: 'All Courses', path: '/courses/all', icon: 'lucide:layout-grid' },
  { label: 'Cart', path: '/user/cart', icon: 'lucide:shopping-cart' },
  { label: 'Wishlist', path: '/user/wishlist', icon: 'lucide:heart' },
  { label: 'Orders', path: '/user/orders', icon: 'lucide:receipt-text' },
  { label: 'My Notes', path: '/user/notes', icon: 'lucide:notebook-pen' },
  { label: 'Add a course', path: '/user/tutor/add-course', icon: 'lucide:square-plus' },
  { label: 'Instructor dashboard', path: '/user/tutor/dashboard', icon: 'lucide:chart-column' },
]

export default {
  name: 'CommandPalette',
  components: { AppIcon },
  data() {
    return {
      open: false,
      query: '',
      active: 0,
      // Server-side course search results — with a 10,000-course catalog we
      // can't just filter a client-side list, so this is fetched on demand.
      courseResults: [],
      searching: false,
      searchTimer: null
    }
  },
  computed: {
    pageResults() {
      const q = this.query.trim().toLowerCase()
      const pages = STATIC_PAGES.map((p) => ({ type: 'page', label: p.label, path: p.path, icon: p.icon }))
      if (!q) return pages.slice(0, 5)
      return pages.filter((p) => p.label.toLowerCase().includes(q))
    },
    results() {
      return [...this.pageResults, ...this.courseResults]
    }
  },
  created() {
    window.addEventListener('keydown', this.onGlobalKey)
    window.addEventListener('open-command-palette', this.openFromEvent)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onGlobalKey)
    window.removeEventListener('open-command-palette', this.openFromEvent)
    if (this.searchTimer) clearTimeout(this.searchTimer)
  },
  watch: {
    query() {
      this.active = 0
      this.scheduleCourseSearch()
    },
    open(val) {
      if (val) {
        this.active = 0
        this.$nextTick(() => this.$refs.input?.focus())
      } else if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
    }
  },
  methods: {
    openFromEvent() {
      this.open = true
    },
    /** Debounce course search calls so typing doesn't fire a request per keystroke. */
    scheduleCourseSearch() {
      if (this.searchTimer) clearTimeout(this.searchTimer)
      const q = this.query.trim()
      if (!q) {
        this.courseResults = []
        return
      }
      this.searchTimer = setTimeout(() => this.runCourseSearch(q), 250)
    },
    async runCourseSearch(q) {
      this.searching = true
      try {
        const response = await axios.get('/courses/search', { params: { q, limit: 8 } })
        this.courseResults = (response.data.data || []).map((c) => ({
          type: 'course', label: c.title, path: `/course/${c.id}`, category: c.category
        }))
      } catch {
        this.courseResults = []
      } finally {
        this.searching = false
      }
    },
    onGlobalKey(e) {
      const isMeta = e.metaKey || e.ctrlKey
      if (isMeta && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        this.open = !this.open
        return
      }
      if (e.key === 'Escape' && this.open) this.close()
    },
    close() {
      this.open = false
      this.query = ''
    },
    activeIndex(r) {
      return this.results.indexOf(r)
    },
    move(delta) {
      if (!this.results.length) return
      this.active = (this.active + delta + this.results.length) % this.results.length
    },
    select(r) {
      const target = r || this.results[this.active]
      if (!target) return
      this.close()
      if (this.$router.currentRoute.value.path !== target.path) this.$router.push(target.path)
    }
  }
}
</script>

<style scoped>
.palette-backdrop {
  position: fixed;
  inset: 0;
  z-index: 4000;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 12vh;
}

.palette-panel {
  width: min(560px, 92vw);
  max-height: 60vh;
  display: flex;
  flex-direction: column;
  border-radius: var(--r-lg);
  overflow: hidden;
  background: var(--surface);
}

.palette-input-row {
  display: flex;
  align-items: center;
  padding: 16px 18px;
  border-bottom: 1px solid var(--glass-border);
  flex-shrink: 0;
}

.palette-input {
  flex-grow: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1rem;
  color: var(--text-strong);
}

.palette-results {
  overflow-y: auto;
  padding: 8px;
}

.palette-empty {
  padding: 24px;
  text-align: center;
  color: var(--text-soft);
  font-size: 0.9rem;
}

.palette-group-label {
  padding: 10px 12px 4px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-faint);
}

.palette-row {
  display: flex;
  align-items: center;
  padding: 11px 12px;
  border-radius: var(--r-sm);
  cursor: pointer;
  color: var(--text-main);
  font-size: 0.92rem;
  font-weight: 600;
}
.palette-row.active,
.palette-row:hover {
  background: var(--grad-primary-soft);
}

.palette-sub {
  color: var(--text-faint);
  font-size: 0.78rem;
  font-weight: 600;
}

.palette-pop-enter-active, .palette-pop-leave-active { transition: opacity 0.15s ease; }
.palette-pop-enter-from, .palette-pop-leave-to { opacity: 0; }
</style>
