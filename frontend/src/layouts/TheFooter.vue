<template>
  <v-footer class="bg-grey-darken-4 text-white py-12 px-6">
    <v-container>
      <v-row>
        <!-- Brand & About -->
        <v-col cols="12" md="4" class="pr-md-10">
          <div class="d-flex align-center mb-6">
            <v-img src="../assets/logof.png" width="180" height="auto" class="mr-2 white-filter"></v-img>
          </div>
          <p class="text-grey-lighten-1 mb-6 text-body-1" style="line-height: 1.8;">
            Online Pathshala is a premium learning platform dedicated to empowering students with expert-led courses. Our mission is to democratize education through high-quality video content and interactive learning.
          </p>
          <div class="d-flex gap-4">
            <v-btn icon variant="tonal" size="small" color="white" class="mr-2">
              <v-icon>mdi-linkedin</v-icon>
            </v-btn>
            <v-btn icon variant="tonal" size="small" color="white" class="mr-2">
              <v-icon>mdi-github</v-icon>
            </v-btn>
            <v-btn icon variant="tonal" size="small" color="white">
              <v-icon>mdi-twitter</v-icon>
            </v-btn>
          </div>
        </v-col>

        <!-- Quick Links -->
        <v-col cols="12" sm="6" md="2">
          <h3 class="text-h6 font-weight-bold mb-6 text-white">Platform</h3>
          <ul class="footer-links">
            <li><router-link to="/">Browse Courses</router-link></li>
            <li><router-link to="/user/tutor/add-course">Teach on Pathshala</router-link></li>
            <li><router-link to="/user/cart">My Cart</router-link></li>
            <li><router-link to="/user/wishlist">Wishlist</router-link></li>
          </ul>
        </v-col>

        <!-- Categories -->
        <v-col cols="12" sm="6" md="3">
          <h3 class="text-h6 font-weight-bold mb-6 text-white">Categories</h3>
          <ul class="footer-links">
            <li v-for="cat in category.slice(0, 4)" :key="cat">
              <a @click="handleCategorySelect(cat)">{{ cat }}</a>
            </li>
          </ul>
        </v-col>

        <!-- Creator Details (Vimlesh Kumar) -->
        <v-col cols="12" md="3">
          <h3 class="text-h6 font-weight-bold mb-6 text-white">Project Creator</h3>
          <v-card variant="tonal" color="white" class="rounded-xl pa-4 bg-white-transparent">
            <div class="d-flex align-center mb-4">
              <v-avatar size="48" color="primary" class="mr-4">
                <span class="text-h6">VK</span>
              </v-avatar>
              <div>
                <div class="font-weight-bold text-subtitle-1">Vimlesh Kumar</div>
                <div class="text-caption text-grey-lighten-2">Web3 / Full Sack Developer</div>
              </div>
            </div>
            <p class="text-caption text-grey-lighten-1 italic mb-4">
              "Building modern solutions for educational excellence."
            </p>
            <v-btn block size="small" color="primary" variant="flat" class="rounded-lg">
              Contact Me
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

      <v-divider class="my-10 border-opacity-25"></v-divider>

      <div class="d-flex flex-column flex-sm-row justify-space-between align-center text-caption text-grey-lighten-1">
        <div>© 2026 Online Pathshala. Built with ❤️ by Vimlesh Kumar.</div>
        <div class="d-flex gap-6 mt-4 mt-sm-0">
          <span class="cursor-pointer hover-white mx-2">Privacy Policy</span>
          <span class="cursor-pointer hover-white mx-2">Terms of Service</span>
          <span class="cursor-pointer hover-white mx-2">Cookie Settings</span>
        </div>
      </div>
    </v-container>
  </v-footer>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'TheFooter',
  computed: {
    ...mapGetters(['category'])
  },
  methods: {
    handleCategorySelect(category) {
      this.$router.push({ path: '/courses/category', query: { category } })
    }
  }
}
</script>

<style scoped>
.footer-links {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: #BDBDBD;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.footer-links a:hover {
  color: white;
  padding-left: 5px;
}

.white-filter {
  filter: brightness(0) invert(1);
}

.bg-white-transparent {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

.hover-white:hover {
  color: white;
}

.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
</style>
