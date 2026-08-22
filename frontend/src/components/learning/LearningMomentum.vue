<template>
  <section v-if="momentum" class="glass-panel section-card p-6 md:p-8">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div class="eyebrow mb-2">Your momentum</div>
        <h2 class="font-display text-xl font-bold">
          {{ streakHeadline }}
        </h2>
      </div>
      <div class="text-right">
        <div class="gradient-text font-display text-2xl leading-none font-black">
          Level {{ momentum.level }}
        </div>
        <div class="text-xs text-muted-foreground">{{ momentum.xp.toLocaleString('en-IN') }} XP</div>
      </div>
    </div>

    <!-- Headline stats -->
    <div class="mb-6 grid gap-4 sm:grid-cols-3">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-2xl border border-black/5 bg-foreground/[0.03] p-4 dark:border-white/10"
      >
        <div class="mb-1 flex items-center gap-2 text-muted-foreground">
          <app-icon :name="stat.icon" size="16" />
          <span class="text-xs font-semibold tracking-wide uppercase">{{ stat.label }}</span>
        </div>
        <div class="font-display text-2xl font-extrabold">{{ stat.value }}</div>
      </div>
    </div>

    <!-- Level progress -->
    <div class="mb-6">
      <div class="mb-1.5 flex items-center justify-between text-xs">
        <span class="text-muted-foreground">Progress to level {{ momentum.level + 1 }}</span>
        <span class="font-bold">{{ momentum.xpIntoLevel }}/{{ momentum.xpPerLevel }} XP</span>
      </div>
      <div class="h-2 overflow-hidden rounded-full bg-foreground/10">
        <div
          class="h-full rounded-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] transition-[width] duration-500"
          :style="{ width: `${levelPercent}%` }"
        ></div>
      </div>
    </div>

    <!-- Activity heatmap -->
    <div class="mb-6">
      <div class="mb-2 flex items-center justify-between">
        <span class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Last 12 weeks
        </span>
        <span class="text-xs text-muted-foreground">{{ momentum.activeDays }} active days</span>
      </div>
      <div class="overflow-x-auto pb-1">
        <div class="grid grid-flow-col grid-rows-7 gap-1">
          <span
            v-for="day in momentum.heatmap"
            :key="day.date"
            class="size-3 rounded-[3px]"
            :class="heatClass(day.count)"
            :title="`${day.date}: ${day.count} action${day.count === 1 ? '' : 's'}`"
          ></span>
        </div>
      </div>
    </div>

    <!-- Achievements -->
    <div>
      <!--
        Badge icons arrive from the API, so the icon-subset generator (which scans
        source files for `prefix:name`) cannot see them. They are listed here so
        `npm run icons` bundles them: lucide:play lucide:layers lucide:notebook-pen
        lucide:compass lucide:star lucide:award lucide:graduation-cap lucide:flame
        lucide:calendar-check lucide:trophy lucide:layers-2 lucide:brain
      -->
      <div class="mb-3 flex items-center justify-between">
        <span class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Achievements
        </span>
        <span class="text-xs text-muted-foreground">
          {{ momentum.earnedBadges }}/{{ momentum.badges.length }} unlocked
        </span>
      </div>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div
          v-for="badge in momentum.badges"
          :key="badge.id"
          class="rounded-2xl border p-3 text-center transition-colors"
          :class="
            badge.earned
              ? 'border-primary/30 bg-primary/10'
              : 'border-black/5 bg-foreground/[0.02] opacity-60 dark:border-white/10'
          "
          :title="badge.hint"
        >
          <app-icon
            :name="badge.icon"
            size="22"
            class="mx-auto mb-1.5"
            :class="badge.earned ? 'text-primary' : 'text-muted-foreground'"
          />
          <div class="text-xs font-bold">{{ badge.label }}</div>
          <div class="mt-0.5 text-[0.68rem] text-muted-foreground">
            {{ badge.earned ? 'Unlocked' : `${badge.progress}/${badge.target}` }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'

export default {
  name: 'LearningMomentum',
  components: { AppIcon },
  data() {
    return { momentum: null }
  },
  computed: {
    streakHeadline() {
      if (!this.momentum.streak) return 'Start a streak today'
      const days = `${this.momentum.streak} day${this.momentum.streak === 1 ? '' : 's'}`
      return this.momentum.studiedToday
        ? `${days} in a row — keep it going 🔥`
        : `${days} in a row — study today to keep it alive`
    },
    stats() {
      return [
        { label: 'Current streak', value: `${this.momentum.streak}d`, icon: 'lucide:flame' },
        { label: 'Best streak', value: `${this.momentum.longestStreak}d`, icon: 'lucide:trophy' },
        { label: 'Lessons done', value: this.momentum.totals.lessons, icon: 'lucide:circle-check' },
      ]
    },
    levelPercent() {
      return Math.round((this.momentum.xpIntoLevel / this.momentum.xpPerLevel) * 100)
    },
  },
  async created() {
    try {
      this.momentum = await this.$store.dispatch('fetchMomentum')
    } catch (error) {
      // A momentum panel is a bonus — never block the page it sits on.
      console.error(error)
    }
  },
  methods: {
    heatClass(count) {
      if (!count) return 'bg-foreground/8'
      if (count < 3) return 'bg-primary/30'
      if (count < 6) return 'bg-primary/60'
      return 'bg-primary'
    },
  },
}
</script>
