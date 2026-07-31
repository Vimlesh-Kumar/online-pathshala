<template>
  <div v-if="!singleCourse" class="mx-auto max-w-[1400px] px-4 pt-10 pb-14">
    <section class="page-intro mb-8 p-6 md:p-10">
      <div class="skeleton mb-4 h-3.5 w-30"></div>
      <div class="skeleton mb-3 h-10 w-[70%]"></div>
      <div class="skeleton h-4.5 w-1/2"></div>
    </section>
  </div>

  <div v-else class="mx-auto max-w-[1400px] px-4 pt-10 pb-14">
    <section class="page-intro mb-8 grid gap-8 p-6 md:grid-cols-12 md:p-10">
      <div class="md:col-span-7">
        <div class="eyebrow mb-4">{{ singleCourse.category }}</div>
        <h1 class="app-section-title mb-4">{{ singleCourse.title }}</h1>
        <p class="mb-5 text-muted-foreground">{{ singleCourse.subtitle }}</p>

        <div class="mb-4 flex flex-wrap items-center gap-4">
          <div class="metric-pill flex items-center gap-2 px-4 py-3">
            <star-rating :model-value="Number(singleCourse.rating || 4.5)" :size="16" />
            <span class="font-bold">{{ singleCourse.rating || 4.5 }}</span>
          </div>
          <div class="metric-pill px-4 py-3">{{ singleCourse.enrolled_students || 0 }} learners</div>
          <div class="metric-pill px-4 py-3">Created by {{ singleCourse.author }}</div>
        </div>
      </div>

      <div class="md:col-span-5">
        <div
          class="glass-panel overflow-hidden rounded-[26px] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
        >
          <img :src="singleCourse.thumb_url" :alt="singleCourse.title" class="h-65 w-full object-cover" />
          <div class="p-6">
            <div class="mb-4 flex items-center justify-between">
              <div class="gradient-text font-display text-3xl font-black">₹{{ formattedPrice }}</div>
              <wish-list :course_id="singleCourse.id" :user="user" />
            </div>

            <button
              v-if="user?.user_role === 'Tutor' && user.id === courseAuthor?.id"
              class="btn-brand mb-3 w-full"
              @click="handleAddCourseLesson"
            >
              Add course content
            </button>

            <template v-else>
              <button
                v-if="isEnrolled"
                class="btn-brand mb-3 w-full"
                @click="$router.push(`/learn/${singleCourse.id}`)"
              >
                <app-icon name="lucide:circle-play" size="18" /> Go to course
              </button>

              <template v-else>
                <button class="btn-brand mb-3 w-full" @click="enrollAndLearn(singleCourse.id)">
                  Enroll for free
                </button>
                <button
                  v-if="!cartCourses.includes(singleCourse.id)"
                  class="mb-3 w-full rounded-full bg-primary/12 px-6 py-3 font-semibold text-primary transition-colors hover:bg-primary/20"
                  @click="addToCart(singleCourse.id)"
                >
                  Add to cart
                </button>
                <button
                  v-else
                  class="mb-3 w-full rounded-full border border-black/10 px-6 py-3 font-semibold transition-colors hover:border-primary/50 dark:border-white/15"
                  @click="$router.push('/user/cart')"
                >
                  Go to cart
                </button>
              </template>
            </template>

            <div class="grid gap-3.5 text-muted-foreground">
              <div v-for="perk in perks" :key="perk.label" class="flex items-center gap-2">
                <app-icon :name="perk.icon" size="18" />{{ perk.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Full width: there is no sidebar down here, so the old 8-of-12 column
         left a dead gutter on the right. -->
    <div>
      <div>
        <div class="glass-panel section-card mb-8 p-6">
          <div class="eyebrow mb-4">What you'll learn</div>
          <div class="grid md:grid-cols-2">
            <div
              v-for="objective in courseObjectives"
              :key="objective.id"
              class="flex items-start gap-1.5 py-3.5"
            >
              <app-icon name="lucide:circle-check" size="18" class="mt-0.5 text-primary" />
              <span>{{ objective.objective }}</span>
            </div>
          </div>
        </div>

        <div class="glass-panel section-card mb-8 p-6">
          <div class="mb-4 flex items-center gap-2">
            <app-icon name="lucide:message-circle-question-mark" size="22" class="text-primary" />
            <div class="eyebrow">Ask about this course</div>
          </div>
          <div class="mb-3 flex gap-3">
            <app-field
              v-model="courseQuestion"
              class="flex-1"
              placeholder="e.g. does this cover functions?"
              @keyup.enter="askCourse"
            />
            <button class="btn-brand shrink-0" :disabled="askingCourse" @click="askCourse">
              <app-icon v-if="askingCourse" name="lucide:loader-circle" size="18" class="animate-spin" />
              Ask
            </button>
          </div>
          <div
            v-if="courseAnswer"
            class="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm"
          >
            {{ courseAnswer }}
          </div>
        </div>

        <course-reviews :course-id="courseId" />

        <course-qna :course-id="courseId" />

        <div class="glass-panel section-card p-6">
          <div class="eyebrow mb-4">Related courses</div>
          <all-courses :all-courses="relatedCourses" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex';
import WishList from '../wishlist/WishList.vue';
import AllCourses from './AllCourses.vue';
import CourseReviews from './CourseReviews.vue';
import CourseQna from './CourseQna.vue';
import { toast } from '@/plugins/toast'
import AppIcon from '@/components/ui/AppIcon.vue';
import AppField from '@/components/ui/AppField.vue';
import StarRating from '@/components/ui/StarRating.vue';

export default {
  components: { WishList, AllCourses, CourseReviews, CourseQna, AppIcon, AppField, StarRating },
  computed: {
    ...mapGetters(['user', 'courseObjectives', 'coursesInCart', 'userCourses']),
    cartCourses() {
      return this.coursesInCart.map((c) => c.id)
    },
    isEnrolled() {
      return this.userCourses.some((c) => c.id === this.singleCourse?.id)
    },
    formattedPrice() {
      return Number(this.singleCourse?.price || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })
    }
  },
  data() {
    return {
      singleCourse: null,
      courseAuthor: null,
      courseId: null,
      relatedCourses: [],
      courseQuestion: '',
      courseAnswer: '',
      askingCourse: false,
      perks: [
        { label: 'Full lifetime access', icon: 'lucide:video' },
        { label: 'Certificate of completion', icon: 'lucide:award' },
        { label: 'Learn on desktop and mobile', icon: 'lucide:smartphone' }
      ]
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
    this.$store.dispatch('fetchingUserCourses');
  },
  methods: {
    handleAddCourseLesson() {
      this.$router.push(`${this.$route.path}/objectives`)
    },
    async enrollAndLearn(id) {
      if (!this.user) {
        this.$router.push('/user/sign-in')
        return
      }
      await this.$store.dispatch('enrollInCourse', id)
      toast.success("You're enrolled — happy learning!")
      this.$router.push(`/learn/${id}`)
    },
    async askCourse() {
      if (!this.courseQuestion.trim()) return
      this.askingCourse = true
      try {
        const result = await this.$store.dispatch('askAboutCourse', {
          courseId: this.courseId,
          question: this.courseQuestion
        })
        this.courseAnswer = result.answer
      } finally {
        this.askingCourse = false
      }
    },
    async addToCart(id) {
      if (!this.user) {
        this.$router.push('/user/sign-in')
        return
      }

      if (!this.cartCourses.includes(id)) {
        await axios.post('/user/cart', { course_id: id })
        await this.$store.dispatch('getCartCourses')
        toast.success('Course added to cart.')
      }
    },
  }
}
</script>
