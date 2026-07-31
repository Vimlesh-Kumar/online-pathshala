<template>
  <div class="glass-panel section-card mb-8 p-6">
    <div class="eyebrow mb-5">Questions &amp; Answers</div>

    <!-- Ask -->
    <div v-if="user" class="mb-6 flex gap-3">
      <app-field
        v-model="newQuestion"
        class="flex-1"
        placeholder="Ask a question about this course"
        @keyup.enter="ask"
      />
      <button class="btn-brand shrink-0" :disabled="asking || !newQuestion.trim()" @click="ask">
        <app-icon v-if="asking" name="lucide:loader-circle" size="18" class="animate-spin" />
        Ask
      </button>
    </div>
    <div v-else class="mb-6 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
      Log in to ask a question.
    </div>

    <div v-if="questions.length" class="flex flex-col gap-5">
      <div
        v-for="q in questions"
        :key="q.id"
        class="border-b border-black/5 pb-4 last:border-b-0 last:pb-0 dark:border-white/10"
      >
        <div class="flex items-start">
          <app-icon name="lucide:circle-help" size="22" class="mt-1 mr-3 shrink-0 text-primary" />
          <div class="flex-1">
            <p class="mb-1 font-display font-bold">{{ q.content }}</p>
            <div class="mb-3 text-xs text-muted-foreground">
              {{ q.author }} · {{ formatDate(q.created_at) }}
            </div>

            <!-- Answers -->
            <div v-for="a in q.answers" :key="a.id" class="mb-2 flex items-start pl-2">
              <app-icon
                name="lucide:message-square-reply"
                size="16"
                class="mt-1 mr-2 shrink-0 text-emerald-500"
              />
              <div>
                <span>{{ a.content }}</span>
                <span class="ml-2 text-xs text-muted-foreground">
                  {{ a.author }}
                  <span
                    v-if="a.author_role === 'Tutor'"
                    class="ml-1 rounded-full bg-primary/15 px-2 py-0.5 text-[0.65rem] font-bold text-primary"
                  >
                    Instructor
                  </span>
                </span>
              </div>
            </div>

            <!-- Answer form -->
            <div v-if="user" class="mt-2 flex gap-2">
              <app-field
                v-model="answerText[q.id]"
                class="flex-1"
                placeholder="Write an answer…"
                @keyup.enter="answer(q.id)"
              />
              <button
                class="shrink-0 rounded-full bg-primary/12 px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                :disabled="!(answerText[q.id] || '').trim()"
                @click="answer(q.id)"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-muted-foreground">No questions yet — start the conversation!</p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AppField from '@/components/ui/AppField.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

export default {
  name: 'CourseQna',
  components: { AppField, AppIcon },
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
