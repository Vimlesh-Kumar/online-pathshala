<template>
  <v-container class="app-section" fluid>
    <div v-if="loading" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <template v-else-if="course">
      <!-- Header -->
      <div class="d-flex align-center flex-wrap ga-3 mb-5">
        <v-btn variant="text" class="px-2" @click="$router.push(`/course/${course.id}`)">
          <v-icon start>mdi-arrow-left</v-icon> Course page
        </v-btn>
        <div class="flex-grow-1">
          <div class="eyebrow mb-1">{{ course.category }}</div>
          <h1 class="player-title">{{ course.title }}</h1>
        </div>
        <div class="progress-chip glass-panel">
          <progress-ring :value="progressPct" :size="52" :stroke-width="6" label-size="13px" />
          <span class="progress-sub">{{ completedCount }}/{{ totalCount }} lessons</span>
        </div>
      </div>
      <v-progress-linear :model-value="progressPct" color="primary" height="8" rounded class="mb-8" />

      <v-row>
        <!-- Player -->
        <v-col cols="12" md="8">
          <v-card class="glass-panel section-card overflow-hidden mb-5" flat>
            <div class="video-wrap">
              <iframe
                v-if="currentLesson"
                :src="videoUrl"
                title="Lesson video"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
            <v-card-text class="pa-6">
              <div class="d-flex align-center justify-space-between flex-wrap ga-4">
                <div>
                  <div class="text-caption text-medium-emphasis mb-1">{{ currentLesson?.section_name }}</div>
                  <h2 class="text-h6 font-weight-bold">{{ currentLesson?.lesson_name }}</h2>
                </div>
                <div class="d-flex ga-3">
                  <v-btn
                    v-if="!isLessonComplete(currentLesson?.id)"
                    class="btn-gradient"
                    :loading="saving"
                    @click="completeAndNext"
                  >
                    <v-icon start>mdi-check</v-icon> Mark complete
                  </v-btn>
                  <v-btn v-else variant="tonal" color="success" disabled>
                    <v-icon start>mdi-check-circle</v-icon> Completed
                  </v-btn>
                  <v-btn variant="outlined" :disabled="!hasNext" @click="goToNext">
                    Next <v-icon end>mdi-arrow-right</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <div v-if="isCompleted" class="d-flex flex-column ga-6">
            <template v-if="!quizPassed">
              <v-alert type="success" variant="tonal" class="section-card" prominent>
                🎉 All lessons complete! Pass the final quiz (70%+) to earn your certificate.
              </v-alert>
              <course-quiz :course-id="course.id" @passed="onQuizPassed" />
            </template>
            <template v-else>
              <v-card class="glass-panel section-card pa-6 text-center position-relative overflow-hidden" flat>
                <div class="eyebrow mb-2">🏆 COURSE COMPLETED</div>
                <h3 class="text-h5 font-weight-bold mb-2">Congratulations, {{ userName }}!</h3>
                <p class="text-body-2 text-medium-emphasis mb-5">You have earned your verified certificate of completion for this course.</p>
                <div class="d-flex justify-center ga-3">
                  <v-btn class="btn-gradient" @click="certModal = true">
                    <v-icon start>mdi-certificate</v-icon> View Certificate
                  </v-btn>
                </div>
              </v-card>
            </template>
          </div>
        </v-col>

        <!-- Curriculum sidebar -->
        <v-col cols="12" md="4">
          <v-card class="glass-panel section-card pa-5" flat>
            <div class="d-flex align-center justify-space-between mb-4">
              <h3 class="text-h6 font-weight-bold">Course content</h3>
              <span class="text-caption text-medium-emphasis">{{ totalCount }} lessons</span>
            </div>

            <div v-for="section in sections" :key="section.name" class="mb-4">
              <div class="section-name mb-2">{{ section.name }}</div>
              <div
                v-for="lesson in section.lessons"
                :key="lesson.id"
                class="lesson-row"
                :class="{ active: lesson.id === currentLessonId }"
                @click="selectLesson(lesson.id)"
              >
                <v-icon :color="isLessonComplete(lesson.id) ? 'success' : undefined" size="20" class="mr-3">
                  {{ isLessonComplete(lesson.id) ? 'mdi-check-circle' : 'mdi-play-circle-outline' }}
                </v-icon>
                <div class="flex-grow-1">
                  <div class="lesson-name">{{ lesson.lesson_name }}</div>
                  <div class="lesson-meta"><v-icon size="12">mdi-clock-outline</v-icon> {{ lesson.duration }}</div>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-card v-else class="glass-panel section-card pa-10 text-center" flat>
      <v-icon size="52" color="primary" class="mb-3">mdi-alert-circle-outline</v-icon>
      <h3 class="text-h6 font-weight-bold mb-4">Course not found.</h3>
      <v-btn class="btn-gradient" @click="$router.push('/courses/all')">Browse courses</v-btn>
    </v-card>

    <!-- Certificate Modal -->
    <v-dialog v-if="course" v-model="certModal" max-width="800px" eager transition="dialog-bottom-transition">
      <v-card class="glass-panel text-center pa-4" flat style="overflow: hidden;">
        <div class="d-flex justify-end">
          <v-btn icon="mdi-close" variant="text" @click="certModal = false" />
        </div>
        <v-card-text class="pt-0">
          <course-certificate :name="userName" :course="course.title" :instructor="course.author" :prop-cert-id="certificateKey" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios'
import CourseQuiz from './CourseQuiz.vue'
import CourseCertificate from './CourseCertificate.vue'
import ProgressRing from '../support/ProgressRing.vue'
import { fireConfetti } from '@/utils/confetti'

export default {
  name: 'CoursePlayer',
  components: { CourseQuiz, CourseCertificate, ProgressRing },
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
      certModal: false
    }
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

      // Auto-enroll (free) so progress can be tracked, then load progress.
      await this.$store.dispatch('enrollInCourse', courseId)
      const progress = await this.$store.dispatch('fetchCourseProgress', courseId)
      this.applyProgress(progress)

      // Resume: first incomplete lesson, else first lesson.
      const firstIncomplete = this.lessons.find((l) => !this.completedIds.includes(l.id))
      this.currentLessonId = (firstIncomplete || this.lessons[0])?.id ?? null

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
  },
  methods: {
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
.player-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(1.4rem, 2.4vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-strong);
  line-height: 1.15;
}

.progress-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px;
  border-radius: var(--r-md);
}
.progress-pct { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.4rem; font-weight: 800; line-height: 1; }
.progress-sub { font-size: 0.75rem; color: var(--text-soft); }

.video-wrap {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  background: #000;
}
.video-wrap iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.section-name {
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-soft);
}

.lesson-row {
  display: flex;
  align-items: center;
  padding: 12px 12px;
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: background 0.15s ease;
}
.lesson-row:hover { background: var(--grad-primary-soft); }
.lesson-row.active {
  background: var(--grad-primary-soft);
  box-shadow: inset 3px 0 0 var(--brand-2);
}
.lesson-name { font-weight: 600; font-size: 0.92rem; color: var(--text-strong); line-height: 1.3; }
.lesson-meta { font-size: 0.75rem; color: var(--text-soft); display: flex; align-items: center; gap: 4px; margin-top: 2px; }
</style>
