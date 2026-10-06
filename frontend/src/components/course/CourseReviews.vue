<template>
  <div class="glass-panel section-card mb-8 p-6">
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div class="eyebrow">Student reviews</div>
      <div v-if="stats.count" class="flex items-center gap-2">
        <span class="gradient-text font-display text-2xl font-extrabold">{{ stats.average.toFixed(1) }}</span>
        <star-rating :model-value="stats.average" :size="18" />
        <span class="text-sm text-muted-foreground">({{ stats.count }})</span>
      </div>
    </div>

    <!-- What learners are saying -->
    <div
      v-if="highlights"
      class="mb-6 rounded-[18px] border border-black/5 bg-foreground/[0.03] p-5 dark:border-white/10"
    >
      <div class="mb-2 text-xs font-extrabold tracking-widest text-muted-foreground uppercase">
        What learners are saying
      </div>
      <p class="mb-3 leading-relaxed font-semibold">{{ highlights.headline }}</p>

      <div v-if="highlights.liked.length || highlights.watchOut.length" class="grid gap-4 sm:grid-cols-2">
        <div v-if="highlights.liked.length">
          <div class="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
            <app-icon name="lucide:thumbs-up" size="15" /> People liked
          </div>
          <ul class="grid gap-1 text-sm text-muted-foreground">
            <li v-for="point in highlights.liked" :key="point">{{ point }}</li>
          </ul>
        </div>
        <div v-if="highlights.watchOut.length">
          <div class="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-400">
            <app-icon name="lucide:info" size="15" /> Worth knowing
          </div>
          <ul class="grid gap-1 text-sm text-muted-foreground">
            <li v-for="point in highlights.watchOut" :key="point">{{ point }}</li>
          </ul>
        </div>
      </div>

      <blockquote
        v-if="highlights.quote"
        class="border-l-2 border-primary/40 pl-3 text-sm text-muted-foreground italic"
      >
        “{{ highlights.quote.text }}” — {{ highlights.quote.author }}
      </blockquote>

      <p v-if="highlights.source === 'ai'" class="mt-3 text-[0.7rem] text-muted-foreground">
        Summarised from {{ stats.count }} reviews by AI, so it may miss some details.
      </p>
    </div>

    <!-- Write a review -->
    <div
      v-if="user"
      class="mb-6 rounded-[18px] border border-black/5 bg-primary/5 p-4.5 dark:border-white/10"
    >
      <div class="mb-3 flex items-center gap-3">
        <span class="font-bold">Your rating:</span>
        <star-rating v-model="myRating" :size="26" :readonly="false" />
      </div>
      <app-field
        v-model="myContent"
        class="mb-3"
        label="Share what you thought (optional)"
        multiline
        :rows="2"
        :maxlength="100"
        :hint="`${myContent.length}/100`"
        placeholder="What stood out about this course?"
      />
      <button class="btn-brand" :disabled="!myRating || submitting" @click="submit">
        <app-icon v-if="submitting" name="lucide:loader-circle" size="18" class="animate-spin" />
        {{ hasMine ? 'Update review' : 'Post review' }}
      </button>
    </div>
    <div
      v-else
      class="mb-6 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm"
    >
      Log in to leave a review.
    </div>

    <!-- Reviews list -->
    <div v-if="reviews.length" class="flex flex-col gap-4">
      <div v-for="r in reviews" :key="r.id" class="flex items-start">
        <span
          class="mr-3 grid size-10 shrink-0 place-items-center rounded-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] font-extrabold text-white uppercase"
        >
          {{ (r.author || '?').charAt(0) }}
        </span>
        <div class="flex-1">
          <div class="mb-1 flex flex-wrap items-center gap-2">
            <span class="font-bold">{{ r.author }}</span>
            <star-rating :model-value="r.rating" :size="14" />
            <span class="text-xs text-muted-foreground">{{ formatDate(r.created_at) }}</span>
          </div>
          <p class="leading-relaxed">{{ r.content || '—' }}</p>
        </div>
      </div>
    </div>
    <p v-else class="text-muted-foreground">No reviews yet — be the first!</p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AppField from '@/components/ui/AppField.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import StarRating from '@/components/ui/StarRating.vue'

export default {
  name: 'CourseReviews',
  components: { AppField, AppIcon, StarRating },
  props: { courseId: { type: [Number, String], required: true } },
  data() {
    return {
      reviews: [],
      stats: { count: 0, average: 0 },
      highlights: null,
      myRating: 0,
      myContent: '',
      submitting: false
    }
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
      this.loadHighlights()
    },
    /** Loaded after the reviews so a slow summary never holds up the list. */
    async loadHighlights() {
      if (this.reviews.length < 3) {
        this.highlights = null
        return
      }
      try {
        this.highlights = await this.$store.dispatch('fetchReviewHighlights', this.courseId)
      } catch (error) {
        // Optional extra — the reviews themselves are already on screen.
        console.error(error)
      }
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
