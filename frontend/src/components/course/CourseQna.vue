<template>
  <v-card class="glass-panel section-card pa-6 mb-8" flat>
    <div class="eyebrow mb-5">Questions &amp; Answers</div>

    <!-- Ask -->
    <div v-if="user" class="d-flex ga-3 mb-6">
      <v-text-field
        v-model="newQuestion" label="Ask a question about this course" variant="outlined"
        density="comfortable" hide-details @keyup.enter="ask"
      />
      <v-btn class="btn-gradient" :loading="asking" :disabled="!newQuestion.trim()" @click="ask">Ask</v-btn>
    </div>
    <v-alert v-else type="info" variant="tonal" class="mb-6">Log in to ask a question.</v-alert>

    <div v-if="questions.length" class="d-flex flex-column ga-5">
      <div v-for="q in questions" :key="q.id" class="qna-item">
        <div class="d-flex align-start">
          <v-icon color="primary" class="mr-3 mt-1">mdi-help-circle-outline</v-icon>
          <div class="flex-grow-1">
            <p class="question-text mb-1">{{ q.content }}</p>
            <div class="text-caption text-medium-emphasis mb-3">
              {{ q.author }} · {{ formatDate(q.created_at) }}
            </div>

            <!-- Answers -->
            <div v-for="a in q.answers" :key="a.id" class="answer-item mb-2">
              <v-icon size="16" color="success" class="mr-2 mt-1">mdi-message-reply-text-outline</v-icon>
              <div>
                <span class="answer-text">{{ a.content }}</span>
                <span class="text-caption text-medium-emphasis ml-2">
                  {{ a.author }}
                  <v-chip v-if="a.author_role === 'Tutor'" size="x-small" color="primary" variant="tonal" class="ml-1">Instructor</v-chip>
                </span>
              </div>
            </div>

            <!-- Answer form -->
            <div v-if="user" class="d-flex ga-2 mt-2">
              <v-text-field
                v-model="answerText[q.id]" placeholder="Write an answer…" variant="outlined"
                density="compact" hide-details @keyup.enter="answer(q.id)"
              />
              <v-btn variant="tonal" size="small" :disabled="!(answerText[q.id] || '').trim()" @click="answer(q.id)">Reply</v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-medium-emphasis mb-0">No questions yet — start the conversation!</p>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CourseQna',
  props: { courseId: { type: [Number, String], required: true } },
  data() {
    return { questions: [], newQuestion: '', answerText: {}, asking: false }
  },
  computed: { ...mapGetters(['user']) },
  created() {
    this.load()
  },
  methods: {
    async load() {
      this.questions = await this.$store.dispatch('fetchQna', this.courseId)
    },
    async ask() {
      if (!this.newQuestion.trim()) return
      this.asking = true
      try {
        await this.$store.dispatch('postQuestion', { courseId: this.courseId, content: this.newQuestion.trim() })
        this.newQuestion = ''
        await this.load()
      } finally {
        this.asking = false
      }
    },
    async answer(qid) {
      const content = (this.answerText[qid] || '').trim()
      if (!content) return
      await this.$store.dispatch('postAnswer', { questionId: qid, content })
      this.answerText[qid] = ''
      await this.load()
    },
    formatDate(d) {
      return d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
    },
  },
}
</script>

<style scoped>
.qna-item { border-bottom: 1px solid var(--glass-border); padding-bottom: 16px; }
.qna-item:last-child { border-bottom: none; padding-bottom: 0; }
.question-text { font-weight: 700; color: var(--text-strong); font-size: 1.02rem; }
.answer-item { display: flex; align-items: flex-start; padding-left: 8px; }
.answer-text { color: var(--text-main); }
</style>
