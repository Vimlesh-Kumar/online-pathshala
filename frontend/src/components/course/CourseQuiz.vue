<template>
  <v-card class="glass-panel section-card pa-6" flat>
    <div class="d-flex align-center ga-2 mb-4">
      <v-icon color="primary">mdi-clipboard-check-outline</v-icon>
      <h3 class="text-h6 font-weight-bold mb-0">Final quiz</h3>
    </div>

    <template v-if="!result">
      <p class="app-section-copy mb-5">Score 70% or higher to earn your certificate.</p>
      <div v-for="(q, i) in questions" :key="q.id" class="quiz-q mb-5">
        <div class="font-weight-bold mb-3">{{ i + 1 }}. {{ q.question }}</div>
        <v-radio-group v-model="answers[q.id]" hide-details density="comfortable">
          <v-radio v-for="opt in optionsFor(q)" :key="opt.value" :value="opt.value" :label="opt.text" color="primary" />
        </v-radio-group>
      </div>
      <v-btn class="btn-gradient" :loading="submitting" :disabled="!allAnswered" @click="submit">Submit quiz</v-btn>
    </template>

    <template v-else>
      <div class="text-center py-4">
        <v-avatar size="72" :class="result.passed ? 'pass-badge' : 'fail-badge'" class="mb-3">
          <v-icon size="40" color="white">{{ result.passed ? 'mdi-trophy' : 'mdi-refresh' }}</v-icon>
        </v-avatar>
        <h3 class="text-h5 font-weight-bold mb-1">{{ result.score }}%</h3>
        <p class="app-section-copy mb-4">
          {{ result.correct }}/{{ result.total }} correct —
          <strong :class="result.passed ? 'text-success' : 'text-error'">{{ result.passed ? 'Passed!' : 'Try again' }}</strong>
        </p>
        <v-btn v-if="!result.passed" variant="tonal" @click="retake">Retake quiz</v-btn>
      </div>
    </template>
  </v-card>
</template>

<script>
export default {
  name: 'CourseQuiz',
  props: { courseId: { type: [Number, String], required: true } },
  emits: ['passed'],
  data() {
    return { questions: [], answers: {}, result: null, submitting: false }
  },
  computed: {
    allAnswered() {
      return this.questions.length > 0 && this.questions.every((q) => this.answers[q.id])
    },
  },
  created() {
    this.load()
  },
  methods: {
    async load() {
      this.questions = await this.$store.dispatch('fetchQuiz', this.courseId)
    },
    optionsFor(q) {
      return [
        { value: 'A', text: q.option_a },
        { value: 'B', text: q.option_b },
        { value: 'C', text: q.option_c },
        { value: 'D', text: q.option_d },
      ].filter((o) => o.text)
    },
    async submit() {
      this.submitting = true
      try {
        this.result = await this.$store.dispatch('submitQuiz', { courseId: this.courseId, answers: this.answers })
        if (this.result.passed) this.$emit('passed')
      } finally {
        this.submitting = false
      }
    },
    retake() {
      this.result = null
      this.answers = {}
    },
  },
}
</script>

<style scoped>
.quiz-q { border-bottom: 1px solid var(--glass-border); padding-bottom: 16px; }
.quiz-q:last-of-type { border-bottom: none; }
.pass-badge { background: var(--grad-primary); box-shadow: var(--shadow-glow); }
.fail-badge { background: var(--grad-accent); }
</style>
