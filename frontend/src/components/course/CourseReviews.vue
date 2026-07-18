<template>
  <v-card class="glass-panel section-card pa-6 mb-8" flat>
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-5">
      <div class="eyebrow">Student reviews</div>
      <div v-if="stats.count" class="d-flex align-center ga-2">
        <span class="avg-rating gradient-text">{{ stats.average.toFixed(1) }}</span>
        <v-rating :model-value="stats.average" color="warning" density="compact" half-increments readonly size="18" />
        <span class="text-body-2 text-medium-emphasis">({{ stats.count }})</span>
      </div>
    </div>

    <!-- Write a review -->
    <div v-if="user" class="review-form mb-6">
      <div class="d-flex align-center ga-3 mb-2">
        <span class="font-weight-bold">Your rating:</span>
        <v-rating v-model="myRating" color="warning" hover size="26" />
      </div>
      <v-textarea
        v-model="myContent" label="Share what you thought (optional)" variant="outlined"
        rows="2" auto-grow hide-details counter="100" maxlength="100" class="mb-3"
      />
      <v-btn class="btn-gradient" :loading="submitting" :disabled="!myRating" @click="submit">
        {{ hasMine ? 'Update review' : 'Post review' }}
      </v-btn>
    </div>
    <v-alert v-else type="info" variant="tonal" class="mb-6">Log in to leave a review.</v-alert>

    <!-- Reviews list -->
    <div v-if="reviews.length" class="d-flex flex-column ga-4">
      <div v-for="r in reviews" :key="r.id" class="review-item">
        <v-avatar size="40" class="review-avatar mr-3">{{ (r.author || '?').charAt(0) }}</v-avatar>
        <div class="flex-grow-1">
          <div class="d-flex align-center ga-2 mb-1">
            <span class="font-weight-bold">{{ r.author }}</span>
            <v-rating :model-value="r.rating" color="warning" density="compact" readonly size="14" />
            <span class="text-caption text-medium-emphasis">{{ formatDate(r.created_at) }}</span>
          </div>
          <p class="mb-0 review-content">{{ r.content || '—' }}</p>
        </div>
      </div>
    </div>
    <p v-else class="text-medium-emphasis mb-0">No reviews yet — be the first!</p>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CourseReviews',
  props: { courseId: { type: [Number, String], required: true } },
  data() {
    return { reviews: [], stats: { count: 0, average: 0 }, myRating: 0, myContent: '', submitting: false }
  },
  computed: {
    ...mapGetters(['user']),
    hasMine() {
      return this.user && this.reviews.some((r) => r.author === this.user.full_name)
    },
  },
  created() {
    this.load()
  },
  methods: {
    async load() {
      const data = await this.$store.dispatch('fetchReviews', this.courseId)
      this.reviews = data.reviews
      this.stats = data.stats
    },
    async submit() {
      if (!this.myRating) return
      this.submitting = true
      try {
        await this.$store.dispatch('postReview', { courseId: this.courseId, rating: this.myRating, content: this.myContent })
        this.myContent = ''
        this.myRating = 0
        await this.load()
      } finally {
        this.submitting = false
      }
    },
    formatDate(d) {
      return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
    },
  },
}
</script>

<style scoped>
.avg-rating { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.6rem; font-weight: 800; }
.review-form {
  background: var(--grad-primary-soft);
  border: 1px solid var(--glass-border);
  border-radius: var(--r-md);
  padding: 18px;
}
.review-item { display: flex; align-items: flex-start; }
.review-avatar { background: var(--grad-primary); color: #fff; font-weight: 800; text-transform: uppercase; }
.review-content { color: var(--text-main); line-height: 1.6; }
</style>
