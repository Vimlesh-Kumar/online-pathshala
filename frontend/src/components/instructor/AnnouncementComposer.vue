<template>
  <div class="glass-panel section-card p-6">
    <div class="mb-1 flex items-center gap-2">
      <app-icon name="lucide:megaphone" size="20" class="text-primary" />
      <h2 class="font-display text-lg font-bold">Announcements</h2>
    </div>
    <p class="mb-5 text-sm text-muted-foreground">
      Post an update and everyone enrolled gets a notification.
    </p>

    <div v-if="courses.length" class="mb-6 flex flex-col gap-3">
      <label class="text-sm font-semibold" for="announcement-course">Course</label>
      <select
        id="announcement-course"
        v-model="courseId"
        class="h-12 w-full rounded-2xl border border-black/10 bg-foreground/[0.04] px-4 outline-none transition focus:border-primary/50 focus:ring-3 focus:ring-primary/20 dark:border-white/12"
      >
        <option v-for="course in courses" :key="course.id" :value="course.id">
          {{ course.title }}
        </option>
      </select>

      <app-field v-model="title" label="Title" :maxlength="200" placeholder="Week 3 live session" />
      <app-field
        v-model="content"
        label="Message"
        multiline
        :rows="4"
        :maxlength="2000"
        placeholder="What do your learners need to know?"
      />

      <div class="flex justify-end">
        <button class="btn-brand" :disabled="posting || !canPost" @click="post">
          <app-icon
            :name="posting ? 'lucide:loader-circle' : 'lucide:send'"
            size="18"
            :class="posting ? 'animate-spin' : ''"
          />
          Post announcement
        </button>
      </div>
    </div>
    <p v-else class="mb-6 text-sm text-muted-foreground">
      Publish a course first — announcements go out to enrolled learners.
    </p>

    <div v-if="posted.length">
      <div class="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Recently posted
      </div>
      <div class="flex flex-col gap-3">
        <article
          v-for="item in posted"
          :key="item.id"
          class="rounded-2xl border border-black/5 bg-foreground/[0.03] p-4 dark:border-white/10"
        >
          <div class="mb-1 flex items-start gap-2">
            <div class="min-w-0 flex-1">
              <h3 class="truncate font-display font-bold">{{ item.title }}</h3>
              <div class="text-xs text-muted-foreground">
                {{ item.course_title }} · {{ formatDate(item.created_at) }}
              </div>
            </div>
            <button
              class="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="Delete announcement"
              :disabled="busyId === item.id"
              @click="remove(item)"
            >
              <app-icon name="lucide:trash-2" size="15" />
            </button>
          </div>
          <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ item.content }}</p>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
import AppField from '@/components/ui/AppField.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { toast } from '@/plugins/toast'

export default {
  name: 'AnnouncementComposer',
  components: { AppField, AppIcon },
  props: {
    /** Courses this instructor can post to, as shown on the dashboard. */
    courses: { type: Array, default: () => [] },
  },
  data() {
    return { courseId: null, title: '', content: '', posting: false, posted: [], busyId: null }
  },
  computed: {
    canPost() {
      return Boolean(this.courseId && this.title.trim() && this.content.trim())
    },
  },
  watch: {
    courses: {
      immediate: true,
      handler(list) {
        if (!this.courseId && list.length) this.courseId = list[0].id
      },
    },
  },
  created() {
    this.load()
  },
  methods: {
    async load() {
      try {
        this.posted = await this.$store.dispatch('fetchMyAnnouncements')
      } catch (error) {
        console.error(error)
      }
    },
    async post() {
      if (!this.canPost) return

      this.posting = true
      try {
        await this.$store.dispatch('postAnnouncement', {
          courseId: this.courseId,
          title: this.title.trim(),
          content: this.content.trim(),
        })
        this.title = ''
        this.content = ''
        await this.load()
        toast.success('Announcement sent to your learners.')
      } catch (error) {
        console.error(error)
        toast.error(error?.response?.data?.message || 'Could not post the announcement.')
      } finally {
        this.posting = false
      }
    },
    async remove(item) {
      this.busyId = item.id
      try {
        await this.$store.dispatch('deleteAnnouncement', item.id)
        this.posted = this.posted.filter((a) => a.id !== item.id)
        toast.success('Announcement deleted.')
      } catch (error) {
        console.error(error)
        toast.error('Could not delete the announcement.')
      } finally {
        this.busyId = null
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
