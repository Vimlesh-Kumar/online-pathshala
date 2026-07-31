<template>
  <div v-if="announcements.length" class="glass-panel section-card p-6">
    <div class="mb-4 flex items-center gap-2">
      <app-icon name="lucide:megaphone" size="20" class="text-primary" />
      <div class="eyebrow">Announcements</div>
    </div>

    <div class="flex flex-col gap-4">
      <article
        v-for="item in visible"
        :key="item.id"
        class="rounded-2xl border border-black/5 bg-foreground/[0.03] p-4 dark:border-white/10"
      >
        <h3 class="mb-1 font-display font-bold">{{ item.title }}</h3>
        <div class="mb-2 text-xs text-muted-foreground">
          {{ item.author }} · {{ formatDate(item.created_at) }}
        </div>
        <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ item.content }}</p>
      </article>
    </div>

    <button
      v-if="announcements.length > collapsedCount"
      class="mt-4 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
      @click="expanded = !expanded"
    >
      {{ expanded ? 'Show less' : `Show ${announcements.length - collapsedCount} older` }}
    </button>
  </div>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'

export default {
  name: 'CourseAnnouncements',
  components: { AppIcon },
  props: { courseId: { type: [Number, String], required: true } },
  data() {
    return { announcements: [], expanded: false, collapsedCount: 2 }
  },
  computed: {
    visible() {
      return this.expanded ? this.announcements : this.announcements.slice(0, this.collapsedCount)
    },
  },
  created() {
    this.load()
  },
  methods: {
    async load() {
      try {
        this.announcements = await this.$store.dispatch('fetchAnnouncements', this.courseId)
      } catch (error) {
        console.error(error)
      }
    },
    formatDate(value) {
      return value
        ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : ''
    },
  },
}
</script>
