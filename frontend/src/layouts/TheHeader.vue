<template>
  <v-app-bar
    flat
    height="84"
    class="header-shell px-2 px-md-6"
  >
    <v-container class="py-0 fill-height">
      <div class="header-panel d-flex align-center w-100 px-2 px-md-4">
        <router-link to="/" class="brand-link d-flex align-center text-decoration-none">
          <v-avatar rounded="lg" size="44" class="mr-3 brand-mark">
            <v-icon color="white" size="26">mdi-school</v-icon>
          </v-avatar>
          <div>
            <div class="brand-name gradient-text">Online Pathshala</div>
            <div class="brand-subtitle">Learn anything, beautifully</div>
          </div>
        </router-link>

        <v-menu open-on-hover transition="slide-y-transition">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              class="ml-4 d-none d-md-inline-flex nav-button"
            >
              Categories
              <v-icon end size="18">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list class="rounded-xl pa-2">
            <v-list-item
              v-for="cat in category"
              :key="cat"
              rounded="lg"
              :title="cat"
              @click="handleCategorySelect(cat)"
            />
          </v-list>
        </v-menu>

        <v-spacer />

        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          placeholder="Search courses, topics, instructors"
          variant="solo-filled"
          flat
          rounded="pill"
          hide-details
          density="comfortable"
          class="search-input mx-2 mx-md-6"
          @keyup.enter="handleSearch"
        >
          <template #append-inner>
            <v-chip
              size="small" variant="outlined" class="kbd-hint d-none d-md-inline-flex"
              @click.stop="openCommandPalette"
            >⌘K</v-chip>
          </template>
        </v-text-field>

        <div class="d-none d-lg-flex align-center mr-4">
          <v-btn variant="text" class="nav-button" @click="$router.push('/courses/all')">Explore</v-btn>
          <v-btn
            v-if="user?.user_role === 'Tutor'"
            variant="text"
            class="nav-button"
            @click="$router.push('/user/tutor/add-course')"
          >
            Teach
          </v-btn>
        </div>

        <v-btn
          icon
          variant="text"
          class="action-button mr-1"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </v-btn>

        <div v-if="user" class="d-flex align-center">
          <v-btn icon variant="text" class="action-button" @click="$router.push('/user/cart')">
            <v-badge :content="cartCount" color="primary" offset-x="4" offset-y="4" :model-value="cartCount > 0">
              <v-icon>mdi-cart-outline</v-icon>
            </v-badge>
          </v-btn>

          <v-btn icon variant="text" class="action-button ml-1" @click="$router.push('/user/wishlist')">
            <v-icon>mdi-heart-outline</v-icon>
          </v-btn>

          <v-menu transition="scale-transition">
            <template #activator="{ props }">
              <v-avatar v-bind="props" size="42" class="ml-3 profile-badge">
                <v-img v-if="user.avatar_url" :src="user.avatar_url" cover />
                <span v-else>{{ user.full_name?.charAt(0) }}</span>
              </v-avatar>
            </template>

            <v-card class="rounded-2xl profile-menu" min-width="240">
              <v-card-text>
                <div class="font-weight-bold text-subtitle-1">{{ user.full_name }}</div>
                <div class="text-body-2 text-medium-emphasis">{{ user.email }}</div>
              </v-card-text>
              <v-divider />
              <v-list class="py-2">
                <v-list-item prepend-icon="mdi-view-dashboard-outline" title="My learning" @click="$router.push('/user')" />
                <v-list-item v-if="user.user_role === 'Tutor'" prepend-icon="mdi-chart-box-outline" title="Instructor dashboard" @click="$router.push('/user/tutor/dashboard')" />
                <v-list-item prepend-icon="mdi-account-cog-outline" title="Profile settings" @click="$router.push('/user/profile')" />
                <v-list-item prepend-icon="mdi-receipt-text-outline" title="My orders" @click="$router.push('/user/orders')" />
                <v-list-item prepend-icon="mdi-logout" title="Logout" @click="handleLogoutClick" />
              </v-list>
            </v-card>
          </v-menu>
        </div>

        <div v-else class="d-flex align-center">
          <v-btn variant="text" class="nav-button mr-2" @click="$router.push('/user/sign-in')">Log in</v-btn>
          <v-btn class="btn-gradient px-6" @click="$router.push('/user/sign-up')">Sign up</v-btn>
        </div>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script>
import { mapGetters } from 'vuex'
import { computed } from 'vue'
import { useTheme } from 'vuetify'

export default {
  setup() {
    const theme = useTheme()
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') theme.change(stored)

    const isDark = computed(() => theme.current.value.dark)
    function toggleTheme() {
      const next = theme.current.value.dark ? 'light' : 'dark'
      theme.change(next)
      localStorage.setItem('theme', next)
    }
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

<style scoped>
.header-shell {
  background: transparent !important;
}

.header-panel {
  height: 64px;
  border-radius: var(--r-pill);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: var(--shadow-md);
}

.brand-link {
  color: var(--text-strong);
}

.brand-mark {
  background: var(--grad-primary);
  box-shadow: var(--shadow-glow);
}

.brand-name {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.12rem;
  font-weight: 800;
  line-height: 1.1;
}

.brand-subtitle {
  color: var(--text-soft);
  font-size: 0.74rem;
}

.search-input {
  max-width: 520px;
}

.kbd-hint {
  cursor: pointer;
  font-weight: 700;
  color: var(--text-soft);
  opacity: 0.85;
}

.nav-button,
.action-button {
  color: var(--text-main);
  font-weight: 600;
}

.profile-badge {
  background: var(--grad-primary);
  color: white;
  font-weight: 800;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: var(--shadow-glow);
}

.profile-menu {
  border: 1px solid var(--glass-border);
}
</style>
