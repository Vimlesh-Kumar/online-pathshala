<template>
  <div class="mx-auto max-w-[1400px] px-4 pt-10 pb-14">
    <section class="page-intro mb-8 p-6 md:p-10">
      <div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div class="eyebrow mb-4">Instructor Dashboard</div>
          <h1 class="app-section-title mb-2">Your teaching at a glance</h1>
          <p class="text-muted-foreground">Track enrollments, ratings, and revenue across your courses.</p>
        </div>
        <button class="btn-brand shrink-0" @click="$router.push('/user/tutor/add-course')">
          <app-icon name="lucide:plus" size="18" /> New course
        </button>
      </div>
    </section>

    <div v-if="loading" class="py-12 text-center">
      <app-icon name="lucide:loader-circle" size="44" class="mx-auto animate-spin text-primary" />
    </div>

    <template v-else>
      <!-- Stat tiles -->
      <div class="mb-4 grid gap-6 sm:grid-cols-3">
        <div
          v-for="tile in tiles"
          :key="tile.label"
          class="glass-panel section-card p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
        >
          <div
            class="mb-3 grid size-12 place-items-center rounded-xl bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] shadow-[0_18px_40px_-14px_rgb(124_58_237_/_0.9)]"
          >
            <app-icon :name="tile.icon" size="22" class="text-white" />
          </div>
          <div class="gradient-text font-display text-[2.2rem] leading-none font-extrabold">
            {{ tile.value }}
          </div>
          <div class="mt-1 text-muted-foreground">{{ tile.label }}</div>
        </div>
      </div>

      <!-- Per-course breakdown -->
      <div class="glass-panel section-card p-6">
        <h2 class="mb-5 font-display text-lg font-bold">Course performance</h2>
        <div v-if="courses.length" class="flex flex-col gap-3">
          <button
            v-for="c in courses"
            :key="c.id"
            class="course-row flex w-full items-center rounded-[18px] border border-black/5 p-3 text-left transition-colors dark:border-white/10"
            @click="$router.push(`/course/${c.id}`)"
          >
            <img :src="c.thumb_url" :alt="c.title" class="h-15 w-24 shrink-0 rounded-lg object-cover" />
            <span class="mx-4 flex-1">
              <span class="line-clamp-1 block font-bold">{{ c.title }}</span>
              <span class="block text-xs text-muted-foreground">{{ c.category }}</span>
            </span>
            <span class="min-w-21 text-center">
              <span class="block font-extrabold">{{ c.enrollments }}</span>
              <span class="block text-[0.72rem] tracking-wide text-muted-foreground uppercase">learners</span>
            </span>
            <span class="min-w-21 text-center">
              <span class="flex items-center justify-center gap-1 font-extrabold">
                <app-icon name="lucide:star" size="16" filled class="text-brand-amber" />
                {{ c.avg_rating.toFixed(1) }}
              </span>
              <span class="block text-[0.72rem] tracking-wide text-muted-foreground uppercase">rating</span>
            </span>
            <span class="min-w-21 text-center">
              <span class="block font-extrabold">₹{{ formatMoney(c.revenue) }}</span>
              <span class="block text-[0.72rem] tracking-wide text-muted-foreground uppercase">revenue</span>
            </span>
          </button>
        </div>
        <div v-else class="py-8 text-center">
          <app-icon name="lucide:graduation-cap" size="52" class="mx-auto mb-3 text-primary" />
          <p class="mb-4 text-muted-foreground">You haven't published any courses yet.</p>
          <button class="btn-brand mx-auto" @click="$router.push('/user/tutor/add-course')">
            Create your first course
          </button>
        </div>
      </div>

      <announcement-composer class="mt-6" :courses="courses" />
    </template>
  </div>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'
import AnnouncementComposer from './AnnouncementComposer.vue'

export default {
  name: 'InstructorDashboard',
  components: { AppIcon, AnnouncementComposer },
  data() {
    return { loading: true, courses: [], totals: { courses: 0, enrollments: 0, revenue: 0 } }
  },
  computed: {
    tiles() {
      return [
        { label: 'Published courses', value: this.totals.courses, icon: 'lucide:library' },
        { label: 'Total enrollments', value: this.totals.enrollments, icon: 'lucide:users' },
        { label: 'Total revenue', value: `₹${this.formatMoney(this.totals.revenue)}`, icon: 'lucide:banknote' },
      ]
    },
  },
  async created() {
    try {
      const data = await this.$store.dispatch('fetchTutorStats')
      this.courses = data.courses
      this.totals = data.totals
    } catch (e) {
      console.error(e)
    } finally {
      this.loading = false
    }
  },
  methods: {
    formatMoney(n) {
      return Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })
    },
  },
}
</script>

<style scoped>
.course-row:hover {
  background: var(--grad-primary-soft);
}
</style>
