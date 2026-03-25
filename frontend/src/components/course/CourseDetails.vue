<template>
  <v-container class="app-section" v-if="singleCourse">
    <section class="page-intro pa-6 pa-md-10 mb-8">
      <v-row>
        <v-col cols="12" md="7">
          <div class="eyebrow mb-4">{{ singleCourse.category }}</div>
          <h1 class="app-section-title mb-4">{{ singleCourse.title }}</h1>
          <p class="app-section-copy mb-5">{{ singleCourse.subtitle }}</p>

          <div class="d-flex flex-wrap align-center ga-4 mb-4">
            <div class="metric-pill px-4 py-3 d-flex align-center">
              <v-rating :model-value="Number(singleCourse.rating || 4.5)" color="warning" density="compact" half-increments readonly size="small" />
              <span class="ml-2 font-weight-bold">{{ singleCourse.rating || 4.5 }}</span>
            </div>
            <div class="metric-pill px-4 py-3">{{ singleCourse.enrolled_students || 0 }} learners</div>
            <div class="metric-pill px-4 py-3">Created by {{ singleCourse.author }}</div>
          </div>
        </v-col>

        <v-col cols="12" md="5">
          <v-card class="section-card detail-side-card" flat>
            <v-img :src="singleCourse.thumb_url" height="260" cover />
            <v-card-text class="pa-6">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="text-h4 font-weight-black">₹{{ singleCourse.price }}</div>
                <wish-list :course_id="singleCourse.id" :user="user" />
              </div>

              <v-btn
                v-if="user?.user_role === 'Tutor' && user.id === courseAuthor?.id"
                block
                color="primary"
                rounded="pill"
                size="large"
                class="mb-3"
                @click="handleAddCourseLesson"
              >
                Add course content
              </v-btn>

              <template v-else>
                <v-btn
                  v-if="!cartCourses.includes(singleCourse.id)"
                  block
                  color="primary"
                  rounded="pill"
                  size="large"
                  class="mb-3"
                  @click="addToCart(singleCourse.id)"
                >
                  Add to cart
                </v-btn>
                <v-btn
                  v-else
                  block
                  variant="outlined"
                  rounded="pill"
                  size="large"
                  class="mb-3"
                  @click="$router.push('/user/cart')"
                >
                  Go to cart
                </v-btn>
              </template>

              <v-alert v-if="showMessage" type="success" variant="tonal" class="mb-4">{{ message }}</v-alert>

              <div class="detail-list">
                <div><v-icon size="18" class="mr-2">mdi-video-outline</v-icon>Full lifetime access</div>
                <div><v-icon size="18" class="mr-2">mdi-certificate-outline</v-icon>Certificate of completion</div>
                <div><v-icon size="18" class="mr-2">mdi-cellphone-play</v-icon>Learn on desktop and mobile</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </section>

    <v-row>
      <v-col cols="12" md="8">
        <v-card class="glass-panel section-card pa-6 mb-8" flat>
          <div class="eyebrow mb-4">What you'll learn</div>
          <v-row>
            <v-col v-for="objective in courseObjectives" :key="objective.id" cols="12" md="6">
              <div class="objective-item">
                <v-icon size="18" color="primary" class="mr-2">mdi-check-circle-outline</v-icon>
                <span>{{ objective.objective }}</span>
              </div>
            </v-col>
          </v-row>
        </v-card>

        <v-card class="glass-panel section-card pa-6" flat>
          <div class="eyebrow mb-4">Related courses</div>
          <all-courses :all-courses="relatedCourses" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex';
import WishList from '../wishlist/WishList.vue';
import AllCourses from './AllCourses.vue';

export default {
  components: { WishList, AllCourses },
  computed: {
    ...mapGetters(['user', 'courseObjectives', 'coursesInCart']),
    cartCourses() {
      return this.coursesInCart.map((c) => c.id)
    }
  },
  data() {
    return {
      singleCourse: null,
      courseAuthor: null,
      courseId: null,
      message: '',
      showMessage: false,
      relatedCourses: []
    }
  },
  async created() {
    this.courseId = this.$route.params.id

    const [courseResponse, relatedResponse] = await Promise.all([
      axios.get(`/course/${this.courseId}`),
      axios.get(`/course/${this.courseId}/related`)
    ])

    this.singleCourse = courseResponse.data.data.course
    this.courseAuthor = courseResponse.data.data.tutor
    this.relatedCourses = relatedResponse.data.data || []

    this.$store.dispatch('getObjectives', this.courseId);
    this.$store.dispatch('fetchingUser');
    this.$store.dispatch('getCartCourses');
    this.$store.dispatch('getWishlistCourses');
  },
  methods: {
    handleAddCourseLesson() {
      this.$router.push(`${this.$route.path}/objectives`)
    },
    async addToCart(id) {
      if (!this.user) {
        this.$router.push('/user/sign-in')
        return
      }

      if (!this.cartCourses.includes(id)) {
        await axios.post('/user/cart', { course_id: id })
        this.message = 'Course added to cart.'
        await this.$store.dispatch('getCartCourses')
        this.showMessage = true
      }
    },
  }
}
</script>

<style scoped>
.detail-side-card {
  overflow: hidden;
  background: rgba(255, 253, 248, 0.94);
  border: 1px solid rgba(31, 41, 55, 0.08);
  box-shadow: 0 24px 48px rgba(20, 33, 61, 0.1);
}

.detail-list {
  display: grid;
  gap: 14px;
  color: #4b5563;
}

.objective-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 14px 0;
  color: #374151;
}
</style>
