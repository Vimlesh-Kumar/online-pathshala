<template>
  <v-main class="bg-grey-lighten-5">
    <!-- Hero Section (Premium Modern Style) -->
    <v-sheet class="hero-section d-flex align-center" color="white" min-height="500">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="6" class="pr-md-12">
            <h1 class="text-h2 font-weight-bold mb-6 text-grey-darken-4 line-height-tight">
              Master New Skills with <span class="text-primary">Pathshala</span>
            </h1>
            <p class="text-h6 text-grey-darken-1 mb-8 font-weight-regular">
              Join thousands of students and start learning from industry experts today. High-quality courses at an affordable price.
            </p>
            <div class="d-flex flex-wrap gap-4">
              <v-btn color="primary" size="x-large" class="rounded-lg px-8 py-4 mr-4 elevation-2 shadow-hover transition-all" @click="$router.push('/courses')">
                Explore Courses
              </v-btn>
              <v-btn variant="outlined" color="primary" size="x-large" class="rounded-lg px-8 py-4 shadow-hover" @click="$router.push('/user/sign-up')">
                Join for Free
              </v-btn>
            </div>
            
            <div class="mt-12 d-flex align-center">
              <div class="d-flex mr-4">
                <v-avatar v-for="i in 3" :key="i" size="40" class="border-2 border-white ml-n4 first-ml-0">
                  <v-img :src="`https://i.pravatar.cc/150?u=${i}`"></v-img>
                </v-avatar>
              </div>
              <div class="text-subtitle-2 text-grey-darken-1">
                <span class="font-weight-bold">10k+</span> Students already joined
              </div>
            </div>
          </v-col>
          
          <v-col cols="12" md="6" class="mt-8 mt-md-0 d-none d-md-block">
            <v-hover v-slot="{ isHovering, props }">
              <v-card v-bind="props" :elevation="isHovering ? 12 : 4" class="rounded-xl overflow-hidden transition-all">
                <v-img cover src="./../assets/homepage2.jpg" height="400" gradient="to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.2) 100%"></v-img>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>

    <v-container class="py-12">
      <div class="d-flex align-center mb-8">
        <div>
          <h2 class="text-h4 font-weight-bold text-grey-darken-4 mb-2">{{ displayTitle }}</h2>
          <div class="v-divider w-25 border-opacity-100 border-primary" style="height: 4px; border-radius: 2px;"></div>
        </div>
        <v-spacer></v-spacer>
        <v-btn v-if="selectedCategory || searchQuery" variant="outlined" color="primary" class="mr-4 rounded-lg" @click="clearFilters">
          Clear Filters <v-icon end>mdi-close</v-icon>
        </v-btn>
        <v-btn variant="text" color="primary" class="font-weight-bold" @click="$router.push('/courses/all')">
          View all <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
      </div>

      <all-courses :allCourses="allCourses.slice(0, 20)"></all-courses>
    </v-container>

    <!-- Features Section (Adding for Realistic feel) -->
    <v-sheet color="grey-lighten-4" class="py-16">
      <v-container>
        <v-row>
          <v-col cols="12" md="4" v-for="feature in features" :key="feature.title">
            <v-card flat class="bg-transparent text-center px-4">
              <v-avatar color="primary-lighten-4" size="64" class="mb-4">
                <v-icon color="primary" size="32">{{ feature.icon }}</v-icon>
              </v-avatar>
              <h3 class="text-h6 font-weight-bold mb-2">{{ feature.title }}</h3>
              <p class="text-body-2 text-grey-darken-1">{{ feature.desc }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>
  </v-main>
</template>

<script>
import { mapGetters } from 'vuex'
import AllCourses from '../components/course/AllCourses.vue'

export default {
  components: {
    AllCourses
  },
  data() {
    return {
      features: [
        { title: 'Learn from Experts', desc: 'Our instructors are industry professionals with years of experience.', icon: 'mdi-school-outline' },
        { title: 'Flexible Learning', desc: 'Access your courses anytime, anywhere on any device.', icon: 'mdi-clock-outline' },
        { title: 'Certification', desc: 'Earn recognized certificates upon completion of your courses.', icon: 'mdi-certificate-outline' }
      ]
    }
  },
  computed: {
    ...mapGetters(['allCourses', 'searchQuery', 'selectedCategory']),
    displayTitle() {
      if (this.selectedCategory) return `Courses in ${this.selectedCategory}`
      if (this.searchQuery) return `Search results for "${this.searchQuery}"`
      return 'Popular Courses'
    }
  },
  methods: {
    clearFilters() {
      this.$store.dispatch('setSearchQuery', '')
      this.$store.dispatch('setSelectedCategory', '')
    }
  },
  created() {
    this.$store.dispatch('fetchingAllCourses')
    this.$store.dispatch('fetchingUser')
  }
}
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
}

.line-height-tight {
  line-height: 1.1 !important;
}

.first-ml-0:first-child {
  margin-left: 0 !important;
}

.shadow-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
}

.transition-all {
  transition: all 0.3s ease;
}

.gap-4 {
  gap: 16px;
}
</style>