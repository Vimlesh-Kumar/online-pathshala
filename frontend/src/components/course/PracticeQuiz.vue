<template>
  <div class="glass-panel section-card p-6">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <app-icon name="lucide:brain" size="22" class="text-primary" />
        <h3 class="font-display text-lg font-bold">Practice questions</h3>
      </div>
      <div v-if="stats.attempts" class="text-xs text-muted-foreground">
        {{ stats.attempts }} attempt{{ stats.attempts === 1 ? '' : 's' }} · best {{ stats.bestScore }}%
      </div>
    </div>

    <!-- Idle -->
    <template v-if="!questions.length && !result">
      <p class="mb-4 text-muted-foreground">
        Unlimited practice generated from this course's content — it doesn't affect your certificate,
        it just tells you what to revisit.
      </p>
      <button class="btn-brand" :disabled="loading" @click="start(false)">
        <app-icon
          :name="loading ? 'lucide:loader-circle' : 'lucide:play'"
          size="18"
          :class="loading ? 'animate-spin' : ''"
        />
        {{ loading ? 'Building questions…' : scopeLabel }}
      </button>
    </template>

    <!-- Answering -->
    <template v-else-if="questions.length && !result">
      <fieldset
        v-for="(question, i) in questions"
        :key="question.id"
        class="mb-5 border-b border-black/5 pb-4 last-of-type:border-b-0 dark:border-white/10"
      >
        <legend class="mb-3 font-bold">{{ i + 1 }}. {{ question.question }}</legend>
        <div class="flex flex-col gap-2">
          <label
            v-for="option in optionsFor(question)"
            :key="option.value"
            class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-foreground/5"
            :class="answers[question.id] === option.value ? 'bg-primary/10' : ''"
          >
            <input
              v-model="answers[question.id]"
              type="radio"
              :name="`practice-${question.id}`"
              :value="option.value"
              class="size-4 accent-[var(--brand-2)]"
            />
            <span>{{ option.text }}</span>
          </label>
        </div>
      </fieldset>

      <div class="flex flex-wrap gap-3">
        <button class="btn-brand" :disabled="submitting || !allAnswered" @click="submit">
          <app-icon v-if="submitting" name="lucide:loader-circle" size="18" class="animate-spin" />
          Check answers
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-2.5 font-semibold transition-colors hover:border-primary/50 dark:border-white/15"
          @click="reset"
        >
          Cancel
        </button>
      </div>
    </template>

    <!-- Results -->
    <template v-else-if="result">
      <div class="mb-5 flex items-center gap-4">
        <span
          class="grid size-16 shrink-0 place-items-center rounded-full font-display text-xl font-black text-white"
          :class="result.score >= 70
            ? 'bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4]'
            : 'bg-linear-135 from-[#f43f5e] to-[#f59e0b]'"
        >
          {{ result.score }}%
        </span>
        <div>
          <div class="font-display text-lg font-bold">
            {{ result.correct }}/{{ result.total }} correct
          </div>
          <p v-if="result.weakTopics.length" class="text-sm text-muted-foreground">
            Worth revisiting: {{ result.weakTopics.join(', ') }}
          </p>
          <p v-else class="text-sm text-emerald-500">Nothing to revisit — that was a clean run.</p>
        </div>
      </div>

      <div
        v-for="item in result.results"
        :key="item.id"
        class="mb-3 rounded-2xl border p-4"
        :class="item.isCorrect
          ? 'border-emerald-500/30 bg-emerald-500/[0.07]'
          : 'border-rose-500/30 bg-rose-500/[0.07]'"
      >
        <div class="mb-1 flex items-start gap-2">
          <app-icon
            :name="item.isCorrect ? 'lucide:circle-check' : 'lucide:circle-x'"
            size="18"
            class="mt-0.5 shrink-0"
            :class="item.isCorrect ? 'text-emerald-500' : 'text-rose-500'"
          />
          <span class="font-semibold">{{ item.question }}</span>
        </div>
        <p v-if="!item.isCorrect" class="pl-6 text-sm text-muted-foreground">
          Correct answer: <strong>{{ item.correctAnswer || item.correctOption }}</strong>
        </p>
        <p v-if="item.explanation" class="pl-6 text-sm text-muted-foreground">{{ item.explanation }}</p>
      </div>

      <div class="mt-5 flex flex-wrap gap-3">
        <button class="btn-brand" :disabled="loading" @click="start(false)">
          <app-icon name="lucide:refresh-cw" size="18" /> Practice again
        </button>
        <button
          class="inline-flex items-center gap-2 rounded-full bg-primary/12 px-5 py-2.5 font-semibold text-primary transition-colors hover:bg-primary/20"
          :disabled="loading"
          @click="start(true)"
        >
          <app-icon name="lucide:sparkles" size="18" /> New questions
        </button>
      </div>
    </template>
  </div>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'
import { toast } from '@/plugins/toast'

export default {
  name: 'PracticeQuiz',
  components: { AppIcon },
  props: {
    courseId: { type: [Number, String], required: true },
    // When set, questions are scoped to a single lesson instead of the whole course.
    lessonId: { type: [Number, String], default: null }
  },
  data() {
    return {
      questions: [],
      answers: {},
      result: null,
      stats: { attempts: 0, bestScore: 0, averageScore: 0 },
      loading: false,
      submitting: false
    }
  },
  computed: {
    allAnswered() {
      return this.questions.length > 0 && this.questions.every((question) => this.answers[question.id])
    },
    scopeLabel() {
      return this.lessonId ? 'Practise this lesson' : 'Practise this course'
    }
  },
  watch: {
    // Moving to another lesson must not leave the previous lesson's round on screen.
    lessonId() {
      this.reset()
      this.loadHistory()
    }
  },
  created() {
    this.loadHistory()
  },
  methods: {
    async loadHistory() {
      try {
        const data = await this.$store.dispatch('fetchPracticeHistory', this.courseId)
        this.stats = data.stats
      } catch (error) {
        // History is decoration — a failure here must not hide the practice button.
        console.error(error)
      }
    },
    async start(refresh) {
      this.loading = true
      try {
        const data = await this.$store.dispatch('fetchPracticeRound', {
          courseId: this.courseId,
          lessonId: this.lessonId,
          refresh
        })
        this.questions = data.questions
        this.answers = {}
        this.result = null
        this.stats = data.stats
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not build a practice round.')
      } finally {
        this.loading = false
      }
    },
    optionsFor(question) {
      return [
        { value: 'A', text: question.option_a },
        { value: 'B', text: question.option_b },
        { value: 'C', text: question.option_c },
        { value: 'D', text: question.option_d }
      ].filter((option) => option.text)
    },
    async submit() {
      this.submitting = true
      try {
        this.result = await this.$store.dispatch('submitPracticeRound', {
          courseId: this.courseId,
          lessonId: this.lessonId,
          answers: this.answers
        })
        this.stats = this.result.stats
        this.questions = []
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not score that round.')
      } finally {
        this.submitting = false
      }
    },
    reset() {
      this.questions = []
      this.answers = {}
      this.result = null
    }
  }
}
</script>
