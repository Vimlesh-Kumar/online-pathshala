<template>
  <div class="mx-auto max-w-[1000px] px-4 pt-10 pb-14">
    <section class="page-intro mb-8 p-6 md:p-10">
      <div class="eyebrow mb-4">Weekly plan</div>
      <h1 class="app-section-title mb-3">Study goals</h1>
      <p class="text-muted-foreground">
        Set a weekly target, pick the days you intend to study, and get a nudge in your
        notifications when the week starts slipping away.
      </p>
    </section>

    <template v-if="plan">
      <!-- Pace -->
      <section class="glass-panel section-card mb-8 p-6 md:p-8">
        <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div class="eyebrow mb-2">This week</div>
            <h2 class="font-display text-xl font-bold">{{ statusHeadline }}</h2>
          </div>
          <span
            class="rounded-full px-4 py-1.5 text-xs font-extrabold tracking-wide uppercase"
            :class="statusClass"
          >
            {{ statusLabel }}
          </span>
        </div>

        <div class="mb-6 grid gap-5 sm:grid-cols-2">
          <div v-for="bar in bars" :key="bar.label">
            <div class="mb-1.5 flex items-center justify-between text-xs">
              <span class="text-muted-foreground">{{ bar.label }}</span>
              <span class="font-bold">{{ bar.done }}/{{ bar.target }}</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-foreground/10">
              <div
                class="h-full rounded-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] transition-[width] duration-500"
                :style="{ width: `${bar.percent}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Week grid -->
        <div class="grid grid-cols-7 gap-2">
          <div
            v-for="day in plan.week.days"
            :key="day.date"
            class="rounded-2xl border p-2 text-center transition-colors"
            :class="dayClass(day)"
            :title="`${day.date}: ${day.actions} action${day.actions === 1 ? '' : 's'}`"
          >
            <div class="text-[0.68rem] font-bold tracking-wide uppercase">{{ day.label }}</div>
            <app-icon
              :name="day.studied ? 'lucide:circle-check' : day.planned ? 'lucide:target' : 'lucide:minus'"
              size="18"
              class="mx-auto my-1"
            />
            <div class="text-[0.68rem] opacity-80">{{ day.lessons || '—' }}</div>
          </div>
        </div>
        <p class="mt-3 text-center text-xs text-muted-foreground">
          {{ plan.week.daysLeft }} day{{ plan.week.daysLeft === 1 ? '' : 's' }} left in this week
        </p>
      </section>

      <!-- Goal editor -->
      <section class="glass-panel section-card p-6 md:p-8">
        <div class="mb-5 flex items-center gap-2">
          <app-icon name="lucide:target" size="20" class="text-primary" />
          <h2 class="font-display text-lg font-bold">Your goal</h2>
        </div>

        <div class="mb-5 grid gap-5 sm:grid-cols-2">
          <label class="block">
            <span class="mb-2 block text-sm font-semibold">Lessons per week</span>
            <input
              v-model.number="form.weeklyLessons"
              type="number"
              min="1"
              max="50"
              class="w-full rounded-xl border border-black/10 bg-transparent px-4 py-2.5 dark:border-white/15"
            />
          </label>
          <label class="block">
            <span class="mb-2 block text-sm font-semibold">Active days per week</span>
            <input
              v-model.number="form.weeklyDays"
              type="number"
              min="1"
              max="7"
              class="w-full rounded-xl border border-black/10 bg-transparent px-4 py-2.5 dark:border-white/15"
            />
          </label>
        </div>

        <div class="mb-5">
          <span class="mb-2 block text-sm font-semibold">Days you plan to study</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(label, index) in weekdayLabels"
              :key="label"
              class="rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
              :class="form.planDays.includes(index)
                ? 'border-primary/40 bg-primary/15 text-primary'
                : 'border-black/10 hover:border-primary/40 dark:border-white/15'"
              @click="toggleDay(index)"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <label class="mb-6 flex cursor-pointer items-center gap-3">
          <input v-model="form.remindersOn" type="checkbox" class="size-4 accent-[var(--brand-2)]" />
          <span class="text-sm">
            Remind me in the notification bell when I fall behind (at most once a day)
          </span>
        </label>

        <button class="btn-brand" :disabled="saving" @click="save">
          <app-icon v-if="saving" name="lucide:loader-circle" size="18" class="animate-spin" />
          Save goal
        </button>
      </section>
    </template>

    <div v-else-if="!loading" class="glass-panel section-card p-8 text-center">
      <app-icon name="lucide:target" size="52" class="mx-auto mb-4 text-primary" />
      <h3 class="font-display text-2xl font-bold">Could not load your plan</h3>
    </div>
  </div>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'
import { toast } from '@/plugins/toast'

const STATUS_META = {
  achieved: { label: 'Goal met', class: 'bg-emerald-500/15 text-emerald-500' },
  'on-track': { label: 'On track', class: 'bg-primary/15 text-primary' },
  slipping: { label: 'Slipping', class: 'bg-amber-500/15 text-amber-500' },
  behind: { label: 'Behind', class: 'bg-rose-500/15 text-rose-500' }
}

export default {
  name: 'StudyGoals',
  components: { AppIcon },
  data() {
    return {
      plan: null,
      loading: true,
      saving: false,
      weekdayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      form: { weeklyLessons: 5, weeklyDays: 3, planDays: [1, 3, 5], remindersOn: true }
    }
  },
  computed: {
    statusLabel() {
      return STATUS_META[this.plan?.progress.status]?.label || ''
    },
    statusClass() {
      return STATUS_META[this.plan?.progress.status]?.class || ''
    },
    statusHeadline() {
      const { lessonsDone, targetLessons, status } = this.plan.progress
      if (status === 'achieved') return `${lessonsDone} lessons done — goal met 🎉`
      const remaining = targetLessons - lessonsDone
      return `${remaining} more lesson${remaining === 1 ? '' : 's'} to hit your goal`
    },
    bars() {
      const { lessonsDone, targetLessons, lessonsPercent, activeDays, targetDays, daysPercent } =
        this.plan.progress
      return [
        { label: 'Lessons completed', done: lessonsDone, target: targetLessons, percent: lessonsPercent },
        { label: 'Active days', done: activeDays, target: targetDays, percent: daysPercent }
      ]
    }
  },
  created() {
    this.load()
  },
  methods: {
    async load() {
      try {
        this.plan = await this.$store.dispatch('fetchStudyPlan')
        this.form = {
          weeklyLessons: this.plan.goal.weeklyLessons,
          weeklyDays: this.plan.goal.weeklyDays,
          planDays: [...this.plan.goal.planDays],
          remindersOn: this.plan.goal.remindersOn
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    toggleDay(index) {
      const position = this.form.planDays.indexOf(index)
      if (position === -1) this.form.planDays.push(index)
      else this.form.planDays.splice(position, 1)
    },
    dayClass(day) {
      if (day.studied) return 'border-primary/40 bg-primary/15 text-primary'
      if (day.planned && !day.isFuture) return 'border-amber-500/40 bg-amber-500/10 text-amber-500'
      if (day.planned) return 'border-black/10 text-muted-foreground dark:border-white/15'
      return 'border-transparent bg-foreground/[0.03] text-muted-foreground'
    },
    async save() {
      this.saving = true
      try {
        this.plan = await this.$store.dispatch('saveStudyGoal', this.form)
        toast.success('Study goal saved.')
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not save your goal.')
      } finally {
        this.saving = false
      }
    }
  }
}
</script>
