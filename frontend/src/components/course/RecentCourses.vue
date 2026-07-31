<template>
  <section v-if="recent.length" class="glass-panel section-card p-6">
    <div class="mb-4 flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <app-icon name="lucide:history" size="20" class="text-primary" />
        <h2 class="font-display text-lg font-bold">Jump back in</h2>
      </div>
      <button
        class="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        @click="clear"
      >
        Clear
      </button>
    </div>

    <div class="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
      <button
        v-for="course in recent"
        :key="course.id"
        class="w-44 shrink-0 overflow-hidden rounded-2xl border border-black/5 bg-foreground/[0.03] text-left transition-transform hover:-translate-y-1 dark:border-white/10"
        @click="$router.push(`/course/${course.id}`)"
      >
        <img
          v-if="course.thumb_url"
          :src="course.thumb_url"
          alt=""
          class="h-24 w-full object-cover"
          loading="lazy"
        />
        <span class="block p-3">
          <span class="line-clamp-2 block text-sm leading-snug font-semibold">{{ course.title }}</span>
          <span class="mt-1 block text-[0.7rem] text-muted-foreground">{{ course.category }}</span>
        </span>
      </button>
    </div>
  </section>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'
import { useRecentCourses } from '@/composables/useRecentCourses'

export default {
  name: 'RecentCourses',
  components: { AppIcon },
  setup() {
    const { recent, clear } = useRecentCourses()
    return { recent, clear }
  },
}
</script>
