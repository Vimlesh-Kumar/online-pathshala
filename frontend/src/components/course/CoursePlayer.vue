<template>
  <div class="mx-auto max-w-[1600px] px-4 pt-10 pb-14">
    <div v-if="loading" class="py-16 text-center">
      <app-icon name="lucide:loader-circle" size="48" class="mx-auto animate-spin text-primary" />
    </div>

    <template v-else-if="course">
      <!-- Header -->
      <div class="mb-5 flex flex-wrap items-center gap-3">
        <button
          class="inline-flex items-center gap-2 rounded-full px-3 py-2 font-semibold text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          @click="$router.push(`/course/${course.id}`)"
        >
          <app-icon name="lucide:arrow-left" size="18" /> Course page
        </button>
        <div class="flex-1">
          <div class="eyebrow mb-1">{{ course.category }}</div>
          <h1
            class="font-display text-[clamp(1.4rem,2.4vw,2rem)] leading-tight font-extrabold tracking-tight"
          >
            {{ course.title }}
          </h1>
        </div>
        <div class="glass-panel flex flex-col items-center rounded-[18px] px-5 py-2.5">
          <progress-ring :value="progressPct" :size="52" :stroke-width="6" label-size="13px" />
          <span class="text-xs text-muted-foreground">{{ completedCount }}/{{ totalCount }} lessons</span>
        </div>
      </div>
      <div class="mb-8 h-2 overflow-hidden rounded-full bg-foreground/10">
        <div
          class="h-full rounded-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] transition-[width] duration-500"
          :style="{ width: `${Math.min(progressPct, 100)}%` }"
        ></div>
      </div>

      <div class="grid gap-6 md:grid-cols-12">
        <!-- Player -->
        <div class="md:col-span-8">
          <div ref="playerCard" class="glass-panel section-card mb-5 overflow-hidden">
            <div class="relative w-full bg-black pt-[56.25%]">
              <!--
                The player is created through the YouTube IFrame API so notes can
                read and seek the playhead; `playerHost` is replaced by its iframe.
                If the API can't load we drop back to a plain embed.
              -->
              <div class="absolute inset-0 size-full">
                <div v-if="!playerUnavailable" ref="playerHost" class="size-full"></div>
                <iframe
                  v-else-if="currentLesson"
                  :src="videoUrl"
                  title="Lesson video"
                  class="size-full"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <div class="mb-1 text-xs text-muted-foreground">{{ currentLesson?.section_name }}</div>
                <h2 class="font-display text-lg font-bold">{{ currentLesson?.lesson_name }}</h2>
                <div
                  v-if="resumedAt"
                  class="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-2.5 py-1 text-xs font-semibold text-primary"
                >
                  <app-icon name="lucide:rotate-ccw" size="13" />
                  Resumed at {{ formatTime(resumedAt) }}
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <!-- Speed + 10s skips: keyboard ← / → do the same. -->
                <div v-if="playerReady" class="flex items-center gap-1 rounded-full bg-foreground/5 p-1">
                  <button
                    class="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                    title="Back 10 seconds (←)"
                    @click="skip(-10)"
                  >
                    <app-icon name="lucide:rotate-ccw" size="16" />
                  </button>
                  <button
                    class="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                    title="Forward 10 seconds (→)"
                    @click="skip(10)"
                  >
                    <app-icon name="lucide:rotate-cw" size="16" />
                  </button>
                  <button
                    class="rounded-full px-3 py-1.5 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
                    title="Playback speed (shift + . / ,)"
                    @click="cycleSpeed"
                  >
                    {{ playbackRate }}×
                  </button>
                </div>

                <button
                  v-if="!isLessonComplete(currentLesson?.id)"
                  class="btn-brand"
                  :disabled="saving"
                  @click="completeAndNext"
                >
                  <app-icon
                    :name="saving ? 'lucide:loader-circle' : 'lucide:check'"
                    size="18"
                    :class="saving ? 'animate-spin' : ''"
                  />
                  Mark complete
                </button>
                <button
                  v-else
                  class="inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-emerald-500/12 px-6 py-3 font-semibold text-emerald-500"
                  disabled
                >
                  <app-icon name="lucide:circle-check" size="18" /> Completed
                </button>
                <button
                  class="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 font-semibold transition-colors hover:border-primary/50 disabled:opacity-50 dark:border-white/15"
                  :disabled="!hasNext"
                  @click="goToNext"
                >
                  Next <app-icon name="lucide:arrow-right" size="18" />
                </button>
              </div>
            </div>
          </div>

          <course-announcements v-if="course" :course-id="course.id" class="mb-5" />

          <lesson-notes
            v-if="course && currentLessonId"
            :key="course.id"
            class="mb-5"
            :course-id="course.id"
            :lesson-id="currentLessonId"
            :get-timestamp="playerReady ? currentTime : null"
            @jump="jumpToNote"
          />

          <practice-quiz
            v-if="course && currentLessonId"
            class="mb-5"
            :course-id="course.id"
            :lesson-id="currentLessonId"
          />

          <div v-if="isCompleted" class="flex flex-col gap-6">
            <template v-if="!quizPassed">
              <div
                class="section-card border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-600 dark:text-emerald-400"
              >
                🎉 All lessons complete! Pass the final quiz (70%+) to earn your certificate.
              </div>
              <course-quiz :course-id="course.id" @passed="onQuizPassed" />
            </template>
            <div v-else class="glass-panel section-card relative overflow-hidden p-6 text-center">
              <div class="eyebrow mb-2">🏆 COURSE COMPLETED</div>
              <h3 class="mb-2 font-display text-2xl font-bold">Congratulations, {{ userName }}!</h3>
              <p class="mb-5 text-sm text-muted-foreground">
                You have earned your verified certificate of completion for this course.
              </p>
              <div class="flex flex-wrap justify-center gap-3">
                <button class="btn-brand" @click="certModal = true">
                  <app-icon name="lucide:award" size="18" /> View Certificate
                </button>
                <button
                  v-if="certificateKey"
                  class="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 font-semibold transition-colors hover:border-primary/50 dark:border-white/15"
                  @click="$router.push(`/verify/${certificateKey}`)"
                >
                  <app-icon name="lucide:shield-check" size="18" /> Verify publicly
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Curriculum sidebar -->
        <div class="md:col-span-4">
          <div class="glass-panel section-card p-5">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="font-display text-lg font-bold">Course content</h3>
              <span class="text-xs text-muted-foreground">{{ totalCount }} lessons</span>
            </div>

            <div v-for="section in sections" :key="section.name" class="mb-4">
              <div class="mb-2 text-xs font-extrabold tracking-widest text-muted-foreground uppercase">
                {{ section.name }}
              </div>
              <button
                v-for="lesson in section.lessons"
                :key="lesson.id"
                class="lesson-row flex w-full items-center rounded-xl p-3 text-left transition-colors"
                :class="{ active: lesson.id === currentLessonId }"
                @click="selectLesson(lesson.id)"
              >
                <app-icon
                  :name="isLessonComplete(lesson.id) ? 'lucide:circle-check' : 'lucide:circle-play'"
                  size="20"
                  class="mr-3 shrink-0"
                  :class="isLessonComplete(lesson.id) ? 'text-emerald-500' : 'text-muted-foreground'"
                />
                <span class="flex-1">
                  <span class="block text-[0.92rem] leading-snug font-semibold">
                    {{ lesson.lesson_name }}
                  </span>
                  <span class="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <app-icon name="lucide:clock" size="12" /> {{ lesson.duration }}
                    <template v-if="resumePointFor(lesson.id)">
                      · left off at {{ formatTime(resumePointFor(lesson.id)) }}
                    </template>
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="glass-panel section-card p-10 text-center">
      <app-icon name="lucide:circle-alert" size="52" class="mx-auto mb-3 text-primary" />
      <h3 class="mb-4 font-display text-lg font-bold">Course not found.</h3>
      <button class="btn-brand mx-auto" @click="$router.push('/courses/all')">Browse courses</button>
    </div>

    <!-- Certificate Modal -->
    <dialog-root v-if="course" v-model:open="certModal">
      <dialog-content class="max-h-[90vh] overflow-y-auto text-center sm:max-w-[800px]">
        <dialog-header class="sr-only">
          <dialog-title>Certificate of completion</dialog-title>
        </dialog-header>
        <course-certificate
          :name="userName"
          :course="course.title"
          :instructor="course.author"
          :prop-cert-id="certificateKey"
        />
      </dialog-content>
    </dialog-root>
  </div>
</template>

<script>
import axios from 'axios'
import CourseQuiz from './CourseQuiz.vue'
import CourseCertificate from './CourseCertificate.vue'
import CourseAnnouncements from './CourseAnnouncements.vue'
import LessonNotes from './LessonNotes.vue'
import PracticeQuiz from './PracticeQuiz.vue'
import ProgressRing from '../support/ProgressRing.vue'
import { fireConfetti } from '@/utils/confetti'
import { useYouTubePlayer } from '@/composables/useYouTubePlayer'
import { useRecentCourses } from '@/composables/useRecentCourses'
import { toast } from '@/plugins/toast'
import AppIcon from '@/components/ui/AppIcon.vue'
import {
  Dialog as DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

/** How often the playhead is checkpointed to the server. */
const PLAYBACK_SAVE_MS = 15000
/** Speeds the ×-button cycles through. */
const SPEEDS = [1, 1.25, 1.5, 1.75, 2, 0.75]

export default {
  name: 'CoursePlayer',
  components: {
    CourseQuiz,
    CourseCertificate,
    CourseAnnouncements,
    LessonNotes,
    PracticeQuiz,
    ProgressRing,
    AppIcon,
    DialogRoot,
    DialogContent,
    DialogHeader,
    DialogTitle
  },
  setup() {
    const { ready, unavailable, rate, play, currentTime, seekTo, skip, setRate } = useYouTubePlayer()
    const { remember } = useRecentCourses()
    return {
      playerReady: ready,
      playerUnavailable: unavailable,
      playbackRate: rate,
      playVideo: play,
      currentTime,
      seekTo,
      skip,
      setRate,
      rememberCourse: remember
    }
  },
  data() {
    return {
      loading: true,
      saving: false,
      course: null,
      lessons: [],
      completedIds: [],
      progressPct: 0,
      isCompleted: false,
      currentLessonId: null,
      quizPassed: false,
      certificateKey: null,
      certModal: false,
      // Video key currently loaded into the player, so a re-render never
      // restarts a video that is already playing.
      mountedVideoKey: null,
      // Position a note asked for, applied when its lesson opens.
      pendingSeek: 0,
      // Saved playback position per lesson, so a return visit resumes.
      playbackPositions: {},
      playbackTimer: null,
      resumedAt: 0
    }
  },
  watch: {
    // `post` so the player host element exists in the DOM before we attach.
    currentLessonId: { handler: 'onLessonChange', flush: 'post' }
  },
  computed: {
    userName() {
      return this.$store.getters.user?.full_name || 'Student'
    },
    sections() {
      const groups = []
      for (const lesson of this.lessons) {
        const name = lesson.section_name || 'Course content'
        let group = groups.find((g) => g.name === name)
        if (!group) {
          group = { name, lessons: [] }
          groups.push(group)
        }
        group.lessons.push(lesson)
      }
      return groups
    },
    currentLesson() {
      return this.lessons.find((l) => l.id === this.currentLessonId) || null
    },
    videoUrl() {
      const key = this.currentLesson?.video_key || ''
      return `https://www.youtube.com/embed/${key}?rel=0&modestbranding=1`
    },
    totalCount() {
      return this.lessons.length
    },
    completedCount() {
      return this.completedIds.length
    },
    hasNext() {
      const i = this.lessons.findIndex((l) => l.id === this.currentLessonId)
      return i > -1 && i < this.lessons.length - 1
    },
  },
  async created() {
    const courseId = Number(this.$route.params.id)
    await this.$store.dispatch('fetchingUser')
    try {
      const [courseRes, lessons] = await Promise.all([
        axios.get(`/course/${courseId}`),
        this.$store.dispatch('fetchCourseLessons', courseId),
      ])
      this.course = courseRes.data?.data?.course || null
      this.lessons = lessons
      if (this.course) this.rememberCourse(this.course)

      // Auto-enroll (free) so progress can be tracked, then load progress.
      await this.$store.dispatch('enrollInCourse', courseId)
      const [progress, positions] = await Promise.all([
        this.$store.dispatch('fetchCourseProgress', courseId),
        this.$store.dispatch('fetchPlaybackPositions', courseId).catch(() => ({}))
      ])
      this.applyProgress(progress)
      this.playbackPositions = positions || {}

      // A note can deep-link here (?lesson=&t=); otherwise resume at the first
      // incomplete lesson, else the first lesson.
      const requestedId = Number(this.$route.query.lesson)
      const requested = this.lessons.find((l) => l.id === requestedId)
      if (requested) {
        this.pendingSeek = Math.max(0, Number(this.$route.query.t) || 0)
        this.currentLessonId = requested.id
      } else {
        const firstIncomplete = this.lessons.find((l) => !this.completedIds.includes(l.id))
        this.currentLessonId = (firstIncomplete || this.lessons[0])?.id ?? null
      }

      // Check if user has already completed/passed the quiz once (from DB progress payload)
      if (progress && progress.certificateKey) {
        this.quizPassed = true
        this.certificateKey = progress.certificateKey
      }
    } catch (e) {
      console.error(e)
    } finally {
      this.loading = false
    }

    // Checkpoint the playhead so closing the tab still resumes near the right spot.
    this.playbackTimer = setInterval(() => this.persistPosition(), PLAYBACK_SAVE_MS)
    window.addEventListener('keydown', this.onShortcut)
  },
  beforeUnmount() {
    if (this.playbackTimer) clearInterval(this.playbackTimer)
    window.removeEventListener('keydown', this.onShortcut)
    this.persistPosition()
  },
  methods: {
    /** Save where the learner was in the outgoing lesson, then open the new one. */
    onLessonChange(_newLessonId, previousLessonId) {
      // The player still holds the previous video at this point.
      this.persistPosition(previousLessonId)
      this.resumedAt = 0
      this.mountVideo()
    },
    /**
     * Load the current lesson's video. A note's timestamp wins; otherwise the
     * lesson picks up from wherever it was last left off.
     */
    mountVideo() {
      const key = this.currentLesson?.video_key
      if (!key) return

      let startSeconds = this.pendingSeek
      this.pendingSeek = 0

      if (!startSeconds) {
        const saved = this.resumePointFor(this.currentLessonId)
        if (saved) {
          startSeconds = saved
          this.resumedAt = saved
        }
      }

      if (key === this.mountedVideoKey && !startSeconds) return

      this.mountedVideoKey = key
      this.playVideo(this.$refs.playerHost || null, key, startSeconds)
    },
    /**
     * A worthwhile place to resume from: far enough in to matter, and only for
     * lessons still in progress.
     */
    resumePointFor(lessonId) {
      if (lessonId == null || this.isLessonComplete(lessonId)) return 0
      const saved = Math.floor(this.playbackPositions[lessonId] || 0)
      return saved > 10 ? saved : 0
    },
    /** Persist the playhead for a lesson, skipping tiny or repeated moves. */
    persistPosition(lessonId = this.currentLessonId) {
      if (!this.course || lessonId == null) return

      const seconds = this.currentTime()
      if (seconds === null || seconds < 5) return
      if (Math.abs((this.playbackPositions[lessonId] || 0) - seconds) < 5) return

      this.playbackPositions[lessonId] = seconds
      this.$store
        .dispatch('savePlaybackPosition', {
          courseId: this.course.id,
          lessonId,
          positionSeconds: seconds
        })
        .catch((error) => console.error(error))
    },
    /** Replay the moment a note was taken at, switching lessons when needed. */
    jumpToNote({ lessonId, seconds }) {
      const targetId = Number(lessonId)
      const startSeconds = Math.max(0, Number(seconds) || 0)

      if (targetId !== this.currentLessonId) {
        this.pendingSeek = startSeconds
        this.currentLessonId = targetId
      } else if (!this.seekTo(startSeconds)) {
        toast.info('Give the video a moment to load, then try the timestamp again.')
        return
      }
      // The player host is swapped out for YouTube's iframe, so scroll the card.
      this.$refs.playerCard?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    async onQuizPassed() {
      this.quizPassed = true

      // Generate unique validation ID based on user name, course title and current date
      const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      const str = `${this.userName}-${this.course.title}-${dateStr}`
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i)
        hash |= 0
      }
      const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')
      const key = `OP-${hex.substring(0, 4)}-${hex.substring(4, 8)}`
      this.certificateKey = key

      try {
        await this.$store.dispatch('issueCertificate', {
          courseId: this.course.id,
          certificateKey: key
        })
      } catch (err) {
        console.error('Failed to save certificate to DB:', err)
      }
      fireConfetti()
    },
    applyProgress(progress) {
      if (!progress) return
      this.completedIds = progress.completedLessonIds || []
      this.progressPct = progress.progress || 0
      this.isCompleted = !!progress.isCompleted
    },
    isLessonComplete(id) {
      return id != null && this.completedIds.includes(id)
    },
    formatTime(seconds) {
      const total = Math.max(0, Math.floor(Number(seconds) || 0))
      const minutes = Math.floor(total / 60)
      return `${minutes}:${String(total % 60).padStart(2, '0')}`
    },
    /** Step through the usual speeds, wrapping back to 1×. */
    cycleSpeed() {
      const next = SPEEDS[(SPEEDS.indexOf(this.playbackRate) + 1) % SPEEDS.length]
      this.setRate(next)
    },
    /** ← / → scrub 10s; shift + , / . change speed. Ignored while typing. */
    onShortcut(event) {
      const target = event.target
      const typing =
        target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)
      if (typing || event.metaKey || event.ctrlKey || event.altKey || !this.playerReady) return

      if (event.key === 'ArrowLeft') this.skip(-10)
      else if (event.key === 'ArrowRight') this.skip(10)
      else if (event.key === '>' || event.key === '<') this.cycleSpeed()
      else return

      event.preventDefault()
    },
    selectLesson(id) {
      this.currentLessonId = id
    },
    goToNext() {
      const i = this.lessons.findIndex((l) => l.id === this.currentLessonId)
      if (i > -1 && i < this.lessons.length - 1) {
        this.currentLessonId = this.lessons[i + 1].id
      }
    },
    async completeAndNext() {
      if (!this.currentLesson) return
      this.saving = true
      try {
        const result = await this.$store.dispatch('markLessonComplete', {
          courseId: this.course.id,
          lessonId: this.currentLesson.id,
        })
        this.applyProgress(result)
        if (this.hasNext) this.goToNext()
      } catch (e) {
        console.error(e)
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style scoped>
.lesson-row:hover {
  background: var(--grad-primary-soft);
}
.lesson-row.active {
  background: var(--grad-primary-soft);
  box-shadow: inset 3px 0 0 var(--brand-2);
}
</style>
