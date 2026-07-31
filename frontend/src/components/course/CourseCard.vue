<template>
  <div class="relative h-full" @mouseenter="scheduleShow" @mouseleave="cancelShow">
    <article
      class="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl bg-card ring-1 shadow-sm ring-black/6 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_28px_60px_-24px_rgb(99_102_241_/_0.55)] hover:ring-primary/35 dark:bg-white/[0.04] dark:ring-white/10"
      :class="{ invisible: showPreview }"
      @click="goToCourse"
    >
      <div class="relative overflow-hidden">
        <img
          :src="course.thumb_url"
          :alt="course.title"
          class="h-44 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-linear-to-t from-slate-950/55 via-transparent to-transparent"></div>

        <span
          class="absolute top-3 left-3 rounded-full bg-slate-950/55 px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.08em] text-white uppercase backdrop-blur-md"
        >
          {{ course.category || 'Course' }}
        </span>

        <span
          v-if="isBestseller"
          class="absolute bottom-3 left-3 rounded-full bg-linear-135 from-[#f43f5e] to-[#f59e0b] px-2.5 py-1 text-[0.65rem] font-extrabold tracking-[0.06em] text-white uppercase shadow-lg"
        >
          Bestseller
        </span>

        <button
          class="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-slate-950/45 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-slate-950/70"
          :class="wished ? 'text-[#fb7185]' : ''"
          :aria-label="wished ? 'Remove from wishlist' : 'Add to wishlist'"
          @click.stop="toggleWishlist"
        >
          <app-icon name="lucide:heart" size="17" :filled="wished" />
        </button>
      </div>

      <div class="flex flex-1 flex-col p-5">
        <h3
          class="line-clamp-2 min-h-[2.7rem] font-display text-[1.05rem] leading-snug font-bold tracking-[-0.01em] transition-colors group-hover:text-primary"
        >
          {{ course.title }}
        </h3>
        <p class="mt-1.5 line-clamp-2 min-h-[2.6rem] text-[0.86rem] leading-relaxed text-muted-foreground">
          {{ course.subtitle }}
        </p>

        <div class="mt-3 flex flex-wrap items-center gap-2">
          <span
            class="inline-flex items-center gap-1.5 rounded-full bg-brand-amber/12 px-2.5 py-1 text-[0.8rem] font-bold text-brand-amber"
          >
            {{ ratingLabel }}
            <star-rating :model-value="rating" :size="12" />
          </span>
          <span class="text-xs text-muted-foreground">{{ course.enrolled_students || 0 }} learners</span>
        </div>

        <div class="mt-4 flex items-center gap-2 border-t border-black/5 pt-4 dark:border-white/8">
          <span
            class="grid size-7 shrink-0 place-items-center rounded-full bg-linear-135 from-[#7c3aed] to-[#06b6d4] text-[0.7rem] font-bold text-white uppercase"
          >
            {{ (course.author || '?').charAt(0) }}
          </span>
          <span class="min-w-0 flex-1 truncate text-[0.8rem] text-muted-foreground">
            {{ course.author }}
          </span>
        </div>

        <div class="mt-3 flex items-center justify-between">
          <div class="gradient-text font-display text-[1.35rem] font-extrabold">₹{{ formattedPrice }}</div>
          <span
            class="grid size-9 place-items-center rounded-full bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground"
          >
            <app-icon
              name="lucide:arrow-right"
              size="17"
              class="transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </article>

    <transition name="hover-preview-pop">
      <div
        v-if="showPreview"
        class="hover-preview absolute -top-3 right-[-10px] left-[-10px] z-40 min-h-[calc(100%+24px)] cursor-pointer rounded-[26px] border border-black/5 bg-card p-5 shadow-2xl dark:border-white/10"
        @click="goToCourse"
      >
        <h4 class="mb-2 line-clamp-2 font-display text-[1.05rem] font-extrabold">{{ course.title }}</h4>
        <div class="mb-3 flex items-center gap-2">
          <span class="text-[0.92rem] font-extrabold text-brand-amber">{{ ratingLabel }}</span>
          <star-rating :model-value="rating" :size="14" />
          <span class="text-xs text-muted-foreground">{{ course.enrolled_students || 0 }} learners</span>
        </div>
        <p class="mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{{ course.subtitle }}</p>
        <ul class="mb-4 grid gap-2 text-[0.84rem]">
          <li v-for="perk in perks" :key="perk.label" class="flex items-center gap-2">
            <app-icon :name="perk.icon" size="16" class="text-primary" />{{ perk.label }}
          </li>
        </ul>
        <button
          class="w-full rounded-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] px-4 py-2.5 font-bold text-white shadow-[0_14px_34px_-12px_rgb(124_58_237_/_0.9)] transition-transform hover:-translate-y-0.5"
          @click.stop="goToCourse"
        >
          View course
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'
import StarRating from '@/components/ui/StarRating.vue'

export default {
  name: 'CourseCard',
  components: { AppIcon, StarRating },
  props: {
    course: { type: Object, required: true },
    wished: { type: Boolean, default: false },
  },
  emits: ['toggle-wishlist'],
  data() {
    return {
      showPreview: false,
      previewTimer: null,
      perks: [
        { label: 'Full lifetime access', icon: 'lucide:video' },
        { label: 'Certificate of completion', icon: 'lucide:award' },
        { label: 'Desktop and mobile', icon: 'lucide:smartphone' },
      ],
    }
  },
  computed: {
    rating() {
      return Number(this.course.rating || 4.5)
    },
    ratingLabel() {
      return this.rating.toFixed(1)
    },
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
.hover-preview-pop-enter-active,
.hover-preview-pop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.hover-preview-pop-enter-from,
.hover-preview-pop-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}

/* The hover preview is a pointer affordance — hide it on touch and small screens. */
@media (hover: none), (max-width: 960px) {
  .hover-preview {
    display: none;
  }
}
</style>
