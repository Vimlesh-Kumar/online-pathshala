<template>
  <v-app-bar
    flat
    height="84"
    class="header-shell px-2 px-md-6"
  >
    <v-container class="py-0 fill-height">
      <div class="header-panel d-flex align-center w-100 px-2 px-md-4">
        <router-link to="/" class="brand-link d-flex align-center text-decoration-none">
          <v-avatar rounded="xl" size="44" color="white" class="mr-3 brand-mark">
            <v-img src="../assets/logo.png"></v-img>
          </v-avatar>
          <div>
            <div class="brand-name">Online Pathshala</div>
            <div class="brand-subtitle">Learn with structure</div>
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
        />

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
                <span>{{ user.full_name?.charAt(0) }}</span>
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
                <v-list-item prepend-icon="mdi-logout" title="Logout" @click="handleLogoutClick" />
              </v-list>
            </v-card>
          </v-menu>
        </div>

        <div v-else class="d-flex align-center">
          <v-btn variant="text" class="nav-button mr-2" @click="$router.push('/user/sign-in')">Log in</v-btn>
          <v-btn color="primary" rounded="pill" class="px-5" @click="$router.push('/user/sign-up')">Sign up</v-btn>
        </div>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      searchQuery: '',
      searchTimeout: null
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
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid rgba(31, 139, 83, 0.15);
  backdrop-filter: blur(18px);
  box-shadow: 0 16px 46px rgba(15, 81, 56, 0.12);
}

.brand-link {
  color: #0f5138;
}

.brand-mark {
  border: 1px solid rgba(31, 139, 83, 0.25);
}

.brand-name {
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1.1;
  color: #0b2d20;
}

.brand-subtitle {
  color: #4b6a5c;
  font-size: 0.75rem;
}

.search-input {
  max-width: 520px;
}

.nav-button,
.action-button {
  color: #0f5138;
  font-weight: 600;
}

.profile-badge {
  background: linear-gradient(135deg, #1f8b53, #4aba8c);
  color: white;
  font-weight: 800;
  text-transform: uppercase;
  cursor: pointer;
}

.profile-menu {
  border: 1px solid rgba(31, 41, 55, 0.08);
}
</style>
