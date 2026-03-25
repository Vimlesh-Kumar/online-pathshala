<template>
  <v-footer class="footer-shell">
    <v-container class="py-8 py-md-12">
      <v-row class="footer-panel pa-6 pa-md-10" no-gutters>
        <v-col cols="12" md="5" class="pr-md-10 mb-8 mb-md-0">
          <div class="eyebrow mb-5">Learning Platform</div>
          <h2 class="footer-title mb-4">Built for practical learning, not just browsing.</h2>
          <p class="footer-copy mb-6">
            Online Pathshala brings structured, affordable courses into one focused experience for students and instructors.
          </p>
          <div class="d-flex flex-wrap ga-3">
            <v-btn variant="outlined" rounded="pill" class="footer-action" @click="$router.push('/courses/all')">Browse courses</v-btn>
            <v-btn color="primary" rounded="pill" class="px-5" @click="$router.push('/user/tutor/add-course')">Teach on Pathshala</v-btn>
          </div>
        </v-col>

        <v-col cols="12" sm="6" md="3" class="mb-6 mb-sm-0">
          <div class="footer-heading">Explore</div>
          <div class="footer-links">
            <button class="footer-link" @click="$router.push('/')">Home</button>
            <button class="footer-link" @click="$router.push('/user')">My learning</button>
            <button class="footer-link" @click="$router.push('/user/cart')">Cart</button>
            <button class="footer-link" @click="$router.push('/user/wishlist')">Wishlist</button>
          </div>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <div class="footer-heading">Popular Categories</div>
          <div class="d-flex flex-wrap ga-3">
            <v-chip
              v-for="cat in category.slice(0, 6)"
              :key="cat"
              variant="outlined"
              rounded="pill"
              class="footer-chip"
              @click="handleCategorySelect(cat)"
            >
              {{ cat }}
            </v-chip>
          </div>
        </v-col>
      </v-row>

      <div class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center px-2 mt-6 footer-meta">
        <span>© 2026 Online Pathshala</span>
        <span>Designed for focused learning and cleaner workflows.</span>
      </div>
    </v-container>
  </v-footer>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['category'])
  },
  methods: {
    handleCategorySelect(category) {
      this.$router.push({ path: '/courses/all', query: { category } })
    }
  }
}
</script>

<style scoped>
.footer-shell {
  background: transparent;
  color: #0b2d20;
}

.footer-panel {
  border-radius: 36px;
  background: #ffffff;
  color: #0b2d20;
  border: 1px solid rgba(31, 139, 83, 0.18);
  box-shadow: 0 24px 60px rgba(15, 81, 56, 0.14);
}

.footer-title {
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #0b2d20;
}

.footer-copy,
.footer-meta {
  color: #4b6a5c;
}

.footer-heading {
  margin-bottom: 16px;
  font-weight: 800;
  font-size: 1rem;
  color: #0f5138;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-link {
  color: #0f4d2d;
  text-align: left;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  font-weight: 600;
}

.footer-link:hover,
.footer-chip:hover {
  color: #1f8b53;
}

.footer-chip {
  color: #0f5138;
  border-color: rgba(31, 139, 83, 0.35);
  font-weight: 600;
}

.footer-action {
  color: #1f8b53;
  border-color: rgba(31, 139, 83, 0.35);
}
</style>
