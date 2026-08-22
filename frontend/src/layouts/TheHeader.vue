<template>
  <header class="sticky top-0 z-50 w-full px-3 pt-3 md:px-6 md:pt-5">
    <div class="mx-auto max-w-[1400px]">
      <div
        class="flex h-16 items-center gap-2 rounded-full border border-black/5 bg-white/80 px-3 shadow-lg backdrop-blur-xl md:gap-3 md:px-5 dark:border-white/10 dark:bg-[#0e1626]/80"
      >
        <router-link to="/" class="flex shrink-0 items-center gap-3 no-underline">
          <span
            class="grid size-11 place-items-center rounded-2xl bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] shadow-[0_10px_30px_-8px_rgb(124_58_237_/_0.8)]"
          >
            <app-icon name="lucide:graduation-cap" size="24" class="text-white" />
          </span>
          <span class="hidden sm:block">
            <span class="gradient-text block font-display text-[1.1rem] leading-tight font-extrabold">
              Online Pathshala
            </span>
            <span class="block text-[0.72rem] text-muted-foreground">Learn anything, beautifully</span>
          </span>
        </router-link>

        <dropdown-menu>
          <dropdown-menu-trigger as-child>
            <button
              class="hidden shrink-0 items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground md:inline-flex"
            >
              Categories
              <app-icon name="lucide:chevron-down" size="16" />
            </button>
          </dropdown-menu-trigger>
          <dropdown-menu-content align="start" class="w-56 rounded-2xl p-2">
            <dropdown-menu-item
              v-for="cat in category"
              :key="cat"
              class="cursor-pointer rounded-xl px-3 py-2 font-medium"
              @click="handleCategorySelect(cat)"
            >
              {{ cat }}
            </dropdown-menu-item>
          </dropdown-menu-content>
        </dropdown-menu>

        <div class="relative mx-1 hidden min-w-0 flex-1 items-center sm:flex md:mx-4">
          <app-icon
            name="lucide:search"
            size="18"
            class="pointer-events-none absolute left-4 text-muted-foreground"
          />
          <input
            v-model="searchQuery"
            type="search"
            aria-label="Search courses"
            placeholder="Search courses, topics, instructors"
            class="h-11 w-full rounded-full border border-white/10 bg-foreground/5 pr-16 pl-11 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:bg-foreground/[0.07] focus:ring-3 focus:ring-primary/20"
            @keyup.enter="handleSearch"
          />
          <button
            type="button"
            class="absolute right-3 hidden rounded-full border border-white/15 px-2 py-0.5 text-[0.7rem] font-bold text-muted-foreground transition-colors hover:text-foreground md:block"
            title="Open command palette"
            @click.stop="openCommandPalette"
          >
            ⌘K
          </button>
        </div>

        <div class="ml-auto flex items-center gap-1 sm:ml-0">
          <div class="hidden items-center lg:flex">
            <button
              class="rounded-full px-3 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
              @click="$router.push('/courses/all')"
            >
              Explore
            </button>
            <button
              v-if="user?.user_role === 'Tutor'"
              class="rounded-full px-3 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
              @click="$router.push('/user/tutor/add-course')"
            >
              Teach
            </button>
          </div>

          <button
            class="grid size-10 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="toggleTheme"
          >
            <app-icon :name="isDark ? 'lucide:sun' : 'lucide:moon'" size="20" />
          </button>

          <template v-if="user">
            <notification-bell />

            <button
              class="relative grid size-10 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
              title="Cart"
              @click="$router.push('/user/cart')"
            >
              <app-icon name="lucide:shopping-cart" size="20" />
              <span
                v-if="cartCount > 0"
                class="absolute top-0.5 right-0.5 grid min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[0.65rem] font-bold text-primary-foreground"
              >
                {{ cartCount }}
              </span>
            </button>

            <button
              class="hidden size-10 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground sm:grid"
              title="Wishlist"
              @click="$router.push('/user/wishlist')"
            >
              <app-icon name="lucide:heart" size="20" />
            </button>

            <dropdown-menu>
              <dropdown-menu-trigger as-child>
                <button
                  class="ml-1 grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] font-extrabold text-white uppercase shadow-[0_10px_30px_-10px_rgb(124_58_237_/_0.9)]"
                  title="Account"
                >
                  <img
                    v-if="user.avatar_url"
                    :src="user.avatar_url"
                    alt=""
                    class="size-full object-cover"
                  />
                  <span v-else>{{ user.full_name?.charAt(0) }}</span>
                </button>
              </dropdown-menu-trigger>

              <dropdown-menu-content align="end" class="w-64 rounded-2xl p-2">
                <div class="px-3 py-2">
                  <div class="truncate font-bold">{{ user.full_name }}</div>
                  <div class="truncate text-sm text-muted-foreground">{{ user.email }}</div>
                </div>
                <dropdown-menu-separator />
                <dropdown-menu-item
                  v-for="item in accountMenu"
                  :key="item.label"
                  class="cursor-pointer gap-3 rounded-xl px-3 py-2 font-medium"
                  @click="item.action()"
                >
                  <app-icon :name="item.icon" size="18" class="text-muted-foreground" />
                  {{ item.label }}
                </dropdown-menu-item>
              </dropdown-menu-content>
            </dropdown-menu>
          </template>

          <template v-else>
            <button
              class="rounded-full px-3 py-2 text-sm font-semibold text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
              @click="$router.push('/user/sign-in')"
            >
              Log in
            </button>
            <button
              class="rounded-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgb(124_58_237_/_0.9)] transition-transform hover:-translate-y-0.5"
              @click="$router.push('/user/sign-up')"
            >
              Sign up
            </button>
          </template>

          <!-- Mobile: search + categories live behind this sheet. -->
          <sheet>
            <sheet-trigger as-child>
              <button
                class="grid size-10 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-foreground/5 sm:hidden"
                title="Menu"
              >
                <app-icon name="lucide:menu" size="22" />
              </button>
            </sheet-trigger>
            <sheet-content side="right" class="w-[88vw] max-w-sm">
              <sheet-header>
                <sheet-title class="gradient-text font-display text-xl font-extrabold">
                  Online Pathshala
                </sheet-title>
              </sheet-header>

              <div class="flex flex-col gap-6 overflow-y-auto px-4 pb-8">
                <div class="relative flex items-center">
                  <app-icon
                    name="lucide:search"
                    size="18"
                    class="pointer-events-none absolute left-4 text-muted-foreground"
                  />
                  <input
                    v-model="searchQuery"
                    type="search"
                    aria-label="Search courses"
                    placeholder="Search courses"
                    class="h-11 w-full rounded-full border border-white/10 bg-foreground/5 pr-4 pl-11 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
                    @keyup.enter="handleSearch"
                  />
                </div>

                <div class="flex flex-col gap-1">
                  <button
                    class="rounded-xl px-3 py-2.5 text-left font-semibold transition-colors hover:bg-foreground/5"
                    @click="$router.push('/courses/all')"
                  >
                    Explore courses
                  </button>
                  <button
                    v-if="user"
                    class="rounded-xl px-3 py-2.5 text-left font-semibold transition-colors hover:bg-foreground/5"
                    @click="$router.push('/user/wishlist')"
                  >
                    Wishlist
                  </button>
                  <button
                    v-if="user"
                    class="rounded-xl px-3 py-2.5 text-left font-semibold transition-colors hover:bg-foreground/5"
                    @click="$router.push('/user/notes')"
                  >
                    My notes
                  </button>
                  <button
                    v-if="user?.user_role === 'Tutor'"
                    class="rounded-xl px-3 py-2.5 text-left font-semibold transition-colors hover:bg-foreground/5"
                    @click="$router.push('/user/tutor/add-course')"
                  >
                    Teach on Pathshala
                  </button>
                </div>

                <div>
                  <div class="mb-2 px-3 text-xs font-bold tracking-widest text-muted-foreground uppercase">
                    Categories
                  </div>
                  <div class="flex flex-wrap gap-2 px-3">
                    <button
                      v-for="cat in category"
                      :key="cat"
                      class="rounded-full border border-white/12 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-foreground/5"
                      @click="handleCategorySelect(cat)"
                    >
                      {{ cat }}
                    </button>
                  </div>
                </div>
              </div>
            </sheet-content>
          </sheet>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters } from 'vuex'
import { useAppTheme } from '@/composables/useAppTheme'
import { clearApiCache } from '@/utils/pwa'
import AppIcon from '@/components/ui/AppIcon.vue'
import NotificationBell from '@/components/support/NotificationBell.vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export default {
  components: {
    AppIcon,
    NotificationBell,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
  },
  setup() {
    const { isDark, toggleTheme } = useAppTheme()
    return { isDark, toggleTheme }
  },
  data() {
    return {
      searchQuery: '',
      searchTimeout: null
    }
  },
  created() {
    // Keep the header's auth state correct on any direct page load / refresh.
    if (!this.user && localStorage.getItem('token')) {
      this.$store.dispatch('fetchingUser')
    }
  },
  computed: {
    ...mapGetters(['user', 'category', 'cartItemCount']),
    cartCount() {
      return this.cartItemCount || 0
    },
    accountMenu() {
      const items = [
        { label: 'My learning', icon: 'lucide:layout-dashboard', action: () => this.$router.push('/user') },
        { label: 'My notes', icon: 'lucide:notebook-pen', action: () => this.$router.push('/user/notes') },
        { label: 'Flashcards', icon: 'lucide:layers', action: () => this.$router.push('/user/flashcards') },
        { label: 'Study goals', icon: 'lucide:target', action: () => this.$router.push('/user/goals') },
        { label: 'Leaderboard', icon: 'lucide:trophy', action: () => this.$router.push('/user/leaderboard') },
        { label: 'Profile settings', icon: 'lucide:user-cog', action: () => this.$router.push('/user/profile') },
        { label: 'My orders', icon: 'lucide:receipt-text', action: () => this.$router.push('/user/orders') },
        { label: 'Logout', icon: 'lucide:log-out', action: () => this.handleLogoutClick() }
      ]
      if (this.user?.user_role === 'Tutor') {
        items.splice(1, 0, {
          label: 'Instructor dashboard',
          icon: 'lucide:chart-column',
          action: () => this.$router.push('/user/tutor/dashboard')
        })
      }
      return items
    }
  },
  watch: {
    '$route.query.q': {
      immediate: true,
      handler(newValue) {
        this.searchQuery = newValue || ''
      }
    },
    searchQuery(value) {
      if (this.searchTimeout) clearTimeout(this.searchTimeout)

      this.searchTimeout = setTimeout(() => {
        if (value?.trim() && this.$route.path !== '/courses/all') {
          this.handleSearch()
        }
      }, 500)
    }
  },
  methods: {
    async handleLogoutClick() {
      localStorage.removeItem('token')
      // Cached API responses belong to the learner who just left.
      await clearApiCache()
      await this.$store.dispatch('fetchingUser')
      this.$router.push('/')
    },
    handleCategorySelect(category) {
      this.$store.dispatch('setSelectedCategory', category)
      this.$router.push({ path: '/courses/all', query: { category } })
    },
    handleSearch() {
      const trimmed = this.searchQuery.trim()
      this.$store.dispatch('setSearchQuery', trimmed)
      this.$router.push({ path: '/courses/all', query: trimmed ? { q: trimmed } : {} })
    },
    openCommandPalette() {
      window.dispatchEvent(new CustomEvent('open-command-palette'))
    }
  },
  beforeUnmount() {
    if (this.searchTimeout) clearTimeout(this.searchTimeout)
  }
}
</script>
