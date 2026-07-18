<template>
  <div class="course-card-wrap" @mouseenter="scheduleShow" @mouseleave="cancelShow">
  <v-card class="course-card glass-panel section-card hover-lift h-100" :class="{ 'is-previewing': showPreview }" flat @click="goToCourse">
    <div class="course-media">
      <v-img cover height="188" :src="course.thumb_url" class="course-img">
        <div class="media-overlay"></div>
      </v-img>

      <v-chip size="small" class="course-chip" label>
        <v-icon start size="14">mdi-shape-outline</v-icon>{{ course.category || 'Course' }}
      </v-chip>

      <span v-if="isBestseller" class="bestseller-tag">Bestseller</span>

      <v-btn
        icon
        size="small"
        class="wishlist-btn"
        :color="wished ? 'accent' : undefined"
        @click.stop="toggleWishlist"
      >
        <v-icon size="20">{{ wished ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
      </v-btn>
    </div>

    <v-card-text class="pa-5 d-flex flex-column">
      <div class="d-flex align-center justify-space-between mb-2">
        <span class="course-author">
          <v-icon size="15" class="mr-1">mdi-account-circle-outline</v-icon>{{ course.author }}
        </span>
        <span class="course-learners">{{ course.enrolled_students || 0 }} learners</span>
      </div>

      <h3 class="course-title line-clamp-2">{{ course.title }}</h3>
      <p class="course-subtitle line-clamp-2 mt-2 mb-0">{{ course.subtitle }}</p>

      <div class="d-flex align-center mt-3">
        <span class="rating-value">{{ Number(course.rating || 4.5).toFixed(1) }}</span>
        <v-rating
          :model-value="Number(course.rating || 4.5)"
          color="warning"
          active-color="warning"
          density="compact"
          half-increments
          readonly
          size="14"
          class="mx-2"
        />
      </div>

      <div class="d-flex align-center justify-space-between mt-4">
        <div class="course-price gradient-text">₹{{ formattedPrice }}</div>
        <span class="view-link">
          View <v-icon size="16">mdi-arrow-right</v-icon>
        </span>
      </div>
    </v-card-text>
  </v-card>

  <transition name="hover-preview-pop">
    <div v-if="showPreview" class="hover-preview glass-panel section-card pa-5" @click="goToCourse">
      <h4 class="preview-title line-clamp-2 mb-2">{{ course.title }}</h4>
      <div class="d-flex align-center mb-3">
        <span class="rating-value mr-2">{{ Number(course.rating || 4.5).toFixed(1) }}</span>
        <v-rating :model-value="Number(course.rating || 4.5)" color="warning" density="compact" half-increments readonly size="14" />
        <span class="ml-2 text-caption text-medium-emphasis">{{ course.enrolled_students || 0 }} learners</span>
      </div>
      <p class="preview-subtitle line-clamp-3 mb-4">{{ course.subtitle }}</p>
      <ul class="includes-list mb-4">
        <li><v-icon size="16" color="primary">mdi-video-outline</v-icon> Full lifetime access</li>
        <li><v-icon size="16" color="primary">mdi-certificate-outline</v-icon> Certificate of completion</li>
        <li><v-icon size="16" color="primary">mdi-cellphone-play</v-icon> Desktop and mobile</li>
      </ul>
      <v-btn block class="btn-gradient" @click.stop="goToCourse">View course</v-btn>
    </div>
  </transition>
  </div>
</template>

<script>
export default {
  name: 'CourseCard',
  props: {
    course: { type: Object, required: true },
    wished: { type: Boolean, default: false },
  },
  emits: ['toggle-wishlist'],
  data() {
    return { showPreview: false, previewTimer: null }
  },
  computed: {
    isBestseller() {
      return Number(this.course.rating || 0) >= 4.5
    },
    formattedPrice() {
      const n = Number(this.course.price || 0)
      return n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    },
  },
  beforeUnmount() {
    if (this.previewTimer) clearTimeout(this.previewTimer)
  },
  methods: {
    goToCourse() {
      this.$store.dispatch('getACourse', this.course)
      this.$router.push(`/course/${this.course.id}`)
    },
    toggleWishlist() {
      this.$emit('toggle-wishlist', this.course)
    },
    scheduleShow() {
      if (this.previewTimer) clearTimeout(this.previewTimer)
      this.previewTimer = setTimeout(() => { this.showPreview = true }, 350)
    },
    cancelShow() {
      if (this.previewTimer) clearTimeout(this.previewTimer)
      this.showPreview = false
    },
  },
}
</script>

<style scoped>
.course-card-wrap {
  position: relative;
  height: 100%;
}

.course-card {
  cursor: pointer;
  overflow: hidden;
  border-radius: var(--r-lg);
}
.course-card.is-previewing {
  visibility: hidden;
}

.hover-preview {
  position: absolute;
  top: -12px;
  left: -10px;
  right: -10px;
  min-height: calc(100% + 24px);
  z-index: 40;
  border-radius: var(--r-lg);
  background: var(--surface);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
}

.preview-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-strong);
}

.preview-subtitle {
  color: var(--text-soft);
  font-size: 0.88rem;
  line-height: 1.5;
}

.includes-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
  font-size: 0.84rem;
  color: var(--text-main);
}
.includes-list li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hover-preview-pop-enter-active, .hover-preview-pop-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.hover-preview-pop-enter-from, .hover-preview-pop-leave-to { opacity: 0; transform: translateY(6px) scale(0.98); }

@media (hover: none) {
  .hover-preview { display: none; }
}
@media (max-width: 960px) {
  .hover-preview { display: none; }
}

.course-media {
  position: relative;
}

.course-img {
  border-top-left-radius: var(--r-lg);
  border-top-right-radius: var(--r-lg);
}

.media-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0) 45%, rgba(15, 23, 42, 0.35) 100%);
}

.course-chip {
  position: absolute;
  top: 14px;
  left: 14px;
  background: var(--glass-bg) !important;
  backdrop-filter: blur(8px);
  font-weight: 700;
  color: var(--text-strong);
}

.bestseller-tag {
  position: absolute;
  bottom: 14px;
  left: 14px;
  padding: 4px 12px;
  border-radius: var(--r-pill);
  background: var(--grad-accent);
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  box-shadow: var(--shadow-sm);
}

.wishlist-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--glass-bg) !important;
  backdrop-filter: blur(8px);
}

.course-author,
.course-learners {
  color: var(--text-soft);
  font-size: 0.82rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.course-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.08rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--text-strong);
  min-height: 2.7rem;
}

.course-subtitle {
  color: var(--text-soft);
  font-size: 0.9rem;
  line-height: 1.55;
  min-height: 2.8rem;
}

.rating-value {
  font-weight: 800;
  color: var(--brand-amber);
  font-size: 0.92rem;
}

.course-price {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
}

.view-link {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-weight: 700;
  color: var(--brand-2);
  font-size: 0.9rem;
}
</style>
