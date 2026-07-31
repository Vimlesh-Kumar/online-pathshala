<template>
  <div class="glass-panel section-card p-6">
    <div class="mb-4 flex items-center gap-2">
      <app-icon name="lucide:clipboard-check" size="22" class="text-primary" />
      <h3 class="font-display text-lg font-bold">Final quiz</h3>
    </div>

    <template v-if="!result">
      <p class="mb-5 text-muted-foreground">Score 70% or higher to earn your certificate.</p>
      <fieldset
        v-for="(q, i) in questions"
        :key="q.id"
        class="mb-5 border-b border-black/5 pb-4 last-of-type:border-b-0 dark:border-white/10"
      >
        <legend class="mb-3 font-bold">{{ i + 1 }}. {{ q.question }}</legend>
        <div class="flex flex-col gap-2">
          <label
            v-for="opt in optionsFor(q)"
            :key="opt.value"
            class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-foreground/5"
            :class="answers[q.id] === opt.value ? 'bg-primary/10' : ''"
          >
            <input
              v-model="answers[q.id]"
              type="radio"
              :name="`q-${q.id}`"
              :value="opt.value"
              class="size-4 accent-[var(--brand-2)]"
            />
            <span>{{ opt.text }}</span>
          </label>
        </div>
      </fieldset>
      <button class="btn-brand" :disabled="submitting || !allAnswered" @click="submit">
        <app-icon v-if="submitting" name="lucide:loader-circle" size="18" class="animate-spin" />
        Submit quiz
      </button>
    </template>

    <div v-else class="py-4 text-center">
      <span
        class="mx-auto mb-3 grid size-18 place-items-center rounded-full"
        :class="result.passed
          ? 'bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] shadow-[0_18px_40px_-14px_rgb(124_58_237_/_0.9)]'
          : 'bg-linear-135 from-[#f43f5e] to-[#f59e0b]'"
      >
        <app-icon
          :name="result.passed ? 'lucide:trophy' : 'lucide:refresh-cw'"
          size="38"
          class="text-white"
        />
      </span>
      <h3 class="mb-1 font-display text-2xl font-bold">{{ result.score }}%</h3>
      <p class="mb-4 text-muted-foreground">
        {{ result.correct }}/{{ result.total }} correct —
        <strong :class="result.passed ? 'text-emerald-500' : 'text-destructive'">
          {{ result.passed ? 'Passed!' : 'Try again' }}
        </strong>
      </p>
      <button
        v-if="!result.passed"
        class="rounded-full bg-primary/12 px-6 py-2.5 font-semibold text-primary transition-colors hover:bg-primary/20"
        @click="retake"
      >
        Retake quiz
      </button>
    </div>
  </div>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'

export default {
  name: 'CourseQuiz',
  components: { AppIcon },
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
