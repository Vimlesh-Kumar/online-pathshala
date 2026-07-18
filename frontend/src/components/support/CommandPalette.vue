<template>
  <transition name="palette-pop">
    <div v-if="open" class="palette-backdrop" @click.self="close">
      <div class="palette-panel glass-panel section-card">
        <div class="palette-input-row">
          <v-icon size="22" class="mr-2" color="primary">mdi-magnify</v-icon>
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
          <v-chip size="small" variant="outlined" class="ml-2">Esc</v-chip>
        </div>

        <div class="palette-results">
          <div v-if="!results.length" class="palette-empty">No matches — try a different keyword.</div>

          <template v-else>
            <div v-if="pageResults.length" class="palette-group-label">Pages</div>
            <div
              v-for="(r, i) in pageResults" :key="'p' + i"
              class="palette-row" :class="{ active: activeIndex(r) === active }"
              @mouseenter="activeIndex(r) !== -1 && (active = activeIndex(r))"
              @click="select(r)"
            >
              <v-icon size="18" class="mr-3" color="primary">{{ r.icon }}</v-icon>
              <span>{{ r.label }}</span>
            </div>

            <div v-if="courseResults.length" class="palette-group-label">Courses</div>
            <div
              v-for="(r, i) in courseResults" :key="'c' + i"
              class="palette-row" :class="{ active: activeIndex(r) === active }"
              @mouseenter="activeIndex(r) !== -1 && (active = activeIndex(r))"
              @click="select(r)"
            >
              <v-icon size="18" class="mr-3" color="primary">mdi-book-open-variant-outline</v-icon>
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
import { mapGetters } from 'vuex'

const STATIC_PAGES = [
  { label: 'Home', path: '/', icon: 'mdi-home-outline' },
  { label: 'My Learning', path: '/user', icon: 'mdi-view-dashboard-outline' },
  { label: 'All Courses', path: '/courses/all', icon: 'mdi-view-grid-outline' },
  { label: 'Cart', path: '/user/cart', icon: 'mdi-cart-outline' },
  { label: 'Wishlist', path: '/user/wishlist', icon: 'mdi-heart-outline' },
  { label: 'Orders', path: '/user/orders', icon: 'mdi-receipt-text-outline' },
  { label: 'Add a course', path: '/user/tutor/add-course', icon: 'mdi-plus-box-outline' },
  { label: 'Instructor dashboard', path: '/user/tutor/dashboard', icon: 'mdi-chart-box-outline' },
]

export default {
  name: 'CommandPalette',
  data() {
    return { open: false, query: '', active: 0, loadedCourses: false }
  },
  computed: {
    ...mapGetters(['allCourses']),
    pageResults() {
      const q = this.query.trim().toLowerCase()
      const pages = STATIC_PAGES.map((p) => ({ type: 'page', label: p.label, path: p.path, icon: p.icon }))
      if (!q) return pages.slice(0, 5)
      return pages.filter((p) => p.label.toLowerCase().includes(q))
    },
    courseResults() {
      const q = this.query.trim().toLowerCase()
      if (!q) return []
      return (this.allCourses || [])
        .filter((c) => c.title?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q))
        .slice(0, 8)
        .map((c) => ({ type: 'course', label: c.title, path: `/course/${c.id}`, category: c.category }))
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
  },
  watch: {
    query() {
      this.active = 0
    },
    open(val) {
      if (val) {
        this.active = 0
        if (!this.loadedCourses) {
          this.loadedCourses = true
          this.$store.dispatch('fetchingAllCourses')
        }
        this.$nextTick(() => this.$refs.input?.focus())
      }
    }
  },
  methods: {
    openFromEvent() {
      this.open = true
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
