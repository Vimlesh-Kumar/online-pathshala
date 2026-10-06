<template>
  <div class="glass-panel section-card p-6">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <span
          class="grid size-10 shrink-0 place-items-center rounded-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] text-white shadow-[0_10px_26px_-12px_rgb(124_58_237_/_0.9)]"
        >
          <app-icon name="lucide:graduation-cap" size="19" />
        </span>
        <div class="min-w-0">
          <div class="eyebrow mb-0.5">Ask your tutor</div>
          <p class="truncate text-xs text-muted-foreground">
            Stuck on something? Ask in your own words.
          </p>
        </div>
      </div>
      <button
        v-if="messages.length"
        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        @click="newChat"
      >
        <app-icon name="lucide:message-square-plus" size="14" /> New chat
      </button>
    </div>

    <div
      ref="scrollArea"
      class="mb-4 flex max-h-[30rem] flex-col gap-3 overflow-y-auto pr-1"
      aria-live="polite"
    >
      <!-- Greeting (UI only — never sent to the model) -->
      <div class="flex justify-start">
        <div class="max-w-[92%] rounded-2xl rounded-bl-md bg-foreground/[0.05] px-4 py-2.5 text-sm leading-relaxed">
          {{ greeting }}
        </div>
      </div>

      <div v-if="!messages.length" class="flex flex-wrap gap-2 pl-1">
        <button
          v-for="prompt in starters"
          :key="prompt.label"
          class="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-1.5 text-left text-sm transition-colors hover:border-primary/50 hover:bg-primary/5 dark:border-white/12"
          @click="send(prompt.text)"
        >
          <app-icon :name="prompt.icon" size="15" class="text-primary" /> {{ prompt.label }}
        </button>
      </div>

      <template v-for="(msg, i) in messages" :key="i">
        <div
          v-if="msg.role === 'divider'"
          class="my-1 flex items-center gap-3 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase"
        >
          <span class="h-px flex-1 bg-foreground/10"></span>
          Now on: {{ msg.content }}
          <span class="h-px flex-1 bg-foreground/10"></span>
        </div>

        <div v-else-if="msg.role === 'user'" class="flex justify-end">
          <div
            class="max-w-[85%] rounded-2xl rounded-br-md bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-white"
          >
            {{ msg.content }}
          </div>
        </div>

        <div v-else class="group flex flex-col items-start">
          <div
            class="tutor-reply max-w-[92%] rounded-2xl rounded-bl-md px-4 py-2.5 text-sm leading-relaxed"
            :class="msg.error ? 'bg-destructive/10 text-destructive' : 'bg-foreground/[0.05]'"
          >
            <span v-if="msg.streaming && !msg.content" class="inline-flex gap-1 py-1" aria-label="Thinking">
              <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
            </span>
            <!-- Safe: renderMiniMarkdown escapes all HTML before adding its own tags. -->
            <div v-else v-html="render(msg.content)"></div>
          </div>

          <!-- Actions for a finished answer -->
          <div v-if="!msg.streaming && msg.content" class="mt-1 flex items-center gap-0.5 pl-1">
            <template v-if="!msg.error">
              <button
                class="reply-action"
                :title="copiedIndex === i ? 'Copied' : 'Copy answer'"
                @click="copy(msg, i)"
              >
                <app-icon :name="copiedIndex === i ? 'lucide:check' : 'lucide:copy'" size="14" />
                {{ copiedIndex === i ? 'Copied' : 'Copy' }}
              </button>
              <button
                class="reply-action"
                :disabled="msg.savedAsNote || savingIndex === i || !lessonId"
                :title="msg.savedAsNote ? 'Already in your notes' : 'Save this answer to your notes for this lesson'"
                @click="saveAsNote(i)"
              >
                <app-icon
                  :name="msg.savedAsNote ? 'lucide:check' : savingIndex === i ? 'lucide:loader-circle' : 'lucide:bookmark-plus'"
                  size="14"
                  :class="savingIndex === i ? 'animate-spin' : ''"
                />
                {{ msg.savedAsNote ? 'Saved to notes' : 'Save to notes' }}
              </button>
            </template>
            <button
              v-if="i === lastReplyIndex && !streaming"
              class="reply-action"
              title="Ask the same question again"
              @click="retry"
            >
              <app-icon name="lucide:refresh-cw" size="14" /> {{ msg.error ? 'Try again' : 'Retry' }}
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Composer -->
    <div class="flex items-end gap-2">
      <app-field
        v-model="input"
        class="flex-1"
        multiline
        :rows="1"
        :maxlength="2000"
        :placeholder="lessonName ? `Ask about “${lessonName}”…` : 'Ask a question…'"
        @keydown.enter.exact.prevent="send()"
      />
      <button
        v-if="streaming"
        class="grid size-12 shrink-0 place-items-center rounded-full border border-black/10 text-muted-foreground transition-colors hover:text-foreground dark:border-white/15"
        aria-label="Stop answering"
        title="Stop"
        @click="stop"
      >
        <app-icon name="lucide:square" size="16" />
      </button>
      <button
        v-else
        class="grid size-12 shrink-0 place-items-center rounded-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] text-white shadow-[0_12px_30px_-12px_rgb(124_58_237_/_0.9)] transition-opacity disabled:opacity-50"
        aria-label="Send"
        :disabled="!input.trim()"
        @click="send()"
      >
        <app-icon name="lucide:send" size="19" />
      </button>
    </div>
    <p class="mt-2 text-[0.7rem] text-muted-foreground">
      Answers come from AI and can be wrong, so double-check anything important. Enter sends,
      Shift+Enter adds a new line.
    </p>
  </div>
</template>

<script>
import AppField from '@/components/ui/AppField.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { renderMiniMarkdown } from '@/utils/miniMarkdown'
import { toast } from '@/plugins/toast'

/** Only follow new text down if the learner hasn't scrolled up to reread. */
const STICK_TO_BOTTOM_PX = 80
/** Messages remembered per course, so a refresh doesn't lose the conversation. */
const REMEMBERED_MESSAGES = 40
const NOTE_MAX = 2000

/** Plain text for a note: notes render as-is, so Markdown markers would show. */
const toPlainText = (markdown) =>
  markdown
    .replace(/```[\w+-]*\n?/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/(^|\s)_([^_]+)_/g, '$1$2')
    .trim()

export default {
  name: 'StudyTutor',
  components: { AppField, AppIcon },
  props: {
    courseId: { type: Number, required: true },
    courseTitle: { type: String, default: '' },
    lessonId: { type: Number, default: null },
    lessonName: { type: String, default: '' },
    /** Reads the playhead so a saved answer lands at the current moment; null without a player. */
    getTimestamp: { type: Function, default: null },
  },
  emits: ['note-saved'],
  data() {
    return {
      input: '',
      // { role: 'user' | 'assistant' | 'divider', content, streaming?, error?, savedAsNote? }
      messages: [],
      streaming: false,
      controller: null,
      copiedIndex: null,
      savingIndex: null,
      starters: [
        { label: "Explain it like I'm new", icon: 'lucide:lightbulb', text: "Explain the main idea of this lesson simply, as if I'm completely new to it." },
        { label: 'Show me a real example', icon: 'lucide:globe', text: 'Show me a real-world example of what this lesson teaches.' },
        { label: 'Quiz me', icon: 'lucide:circle-help', text: 'Quiz me on this lesson. Ask one question at a time and wait for my answer.' },
        { label: 'What should I know first?', icon: 'lucide:route', text: 'What should I already understand before this lesson?' },
      ],
    }
  },
  computed: {
    storageKey() {
      return `pathshala:tutor:${this.courseId}`
    },
    greeting() {
      const firstName = (this.$store.getters.user?.full_name || '').trim().split(/\s+/)[0]
      const hello = firstName ? `Hi ${firstName}!` : 'Hi there!'
      const topic = this.lessonName ? `“${this.lessonName}”` : 'this course'
      const invite = this.courseTitle
        ? `I know my way around ${this.courseTitle}, so ask me anything about ${topic}.`
        : `Ask me anything about ${topic}.`
      const nudge = this.messages.length
        ? ' Nothing is too basic.'
        : ' Nothing is too basic — not sure where to start? Pick one of these.'
      return `${hello} ${invite}${nudge}`
    },
    lastReplyIndex() {
      for (let i = this.messages.length - 1; i >= 0; i -= 1) {
        if (this.messages[i].role === 'assistant') return i
      }
      return -1
    },
  },
  watch: {
    // Mark the switch so earlier answers read as being about the old lesson.
    lessonId(newId, oldId) {
      if (newId !== oldId && this.messages.length && this.lessonName) {
        const last = this.messages[this.messages.length - 1]
        // Clicking through several lessons without asking anything leaves one divider, not a stack.
        if (last.role === 'divider') last.content = this.lessonName
        else this.messages.push({ role: 'divider', content: this.lessonName })
        this.remember()
        this.scrollToBottom(true)
      }
    },
  },
  created() {
    this.restore()
  },
  mounted() {
    this.scrollToBottom(true)
  },
  beforeUnmount() {
    this.controller?.abort()
  },
  methods: {
    render: renderMiniMarkdown,
    async send(preset) {
      const text = (preset ?? this.input).trim()
      if (!text || this.streaming) return

      // Only real exchanges go upstream — the greeting, dividers and error bubbles are UI-only.
      const history = this.messages
        .filter((m) => (m.role === 'user' || m.role === 'assistant') && !m.error && m.content)
        .map((m) => ({ role: m.role, content: m.content }))
      history.push({ role: 'user', content: text })

      this.messages.push({ role: 'user', content: text })
      this.messages.push({ role: 'assistant', content: '', streaming: true, error: false })
      // Re-read through the reactive array so chunk updates re-render.
      const replyIndex = this.messages.length - 1
      this.input = ''
      this.streaming = true
      this.controller = new AbortController()
      this.scrollToBottom(true)

      try {
        await this.$store.dispatch('streamStudyTutor', {
          courseId: this.courseId,
          lessonId: this.lessonId,
          messages: history,
          signal: this.controller.signal,
          onChunk: (chunk) => {
            this.messages[replyIndex].content += chunk
            this.scrollToBottom()
          },
        })
      } catch (error) {
        const target = this.messages[replyIndex]
        if (!target) return
        if (error?.name === 'AbortError') {
          if (!target.content) target.content = '_(Stopped.)_'
        } else {
          console.error(error)
          target.error = true
          target.content =
            error?.status === 403
              ? 'Your session has expired. Please sign in again to keep chatting.'
              : error?.message || "I couldn't answer just now. Please try again in a moment."
        }
      } finally {
        if (this.messages[replyIndex]) this.messages[replyIndex].streaming = false
        this.streaming = false
        this.controller = null
        this.remember()
        this.scrollToBottom()
      }
    },
    /** Drop the last answer (and its question) and ask again. */
    retry() {
      const replyIndex = this.lastReplyIndex
      const question = this.messages[replyIndex - 1]
      if (replyIndex < 1 || question?.role !== 'user') return
      this.messages.splice(replyIndex - 1, 2)
      this.send(question.content)
    },
    stop() {
      this.controller?.abort()
    },
    newChat() {
      this.controller?.abort()
      this.messages = []
      this.input = ''
      this.remember()
    },
    async copy(msg, index) {
      try {
        await navigator.clipboard.writeText(toPlainText(msg.content))
        this.copiedIndex = index
        setTimeout(() => {
          if (this.copiedIndex === index) this.copiedIndex = null
        }, 1800)
      } catch {
        toast.error("Couldn't copy — your browser blocked clipboard access.")
      }
    },
    /** Save an answer (with the question that prompted it) as a note on the current lesson. */
    async saveAsNote(index) {
      const reply = this.messages[index]
      const question = this.messages[index - 1]?.role === 'user' ? this.messages[index - 1].content : ''
      if (!reply || !this.lessonId) return

      const content = (question ? `Q: ${question}\n\n` : '') + toPlainText(reply.content)
      this.savingIndex = index
      try {
        const note = await this.$store.dispatch('createNote', {
          courseId: this.courseId,
          lessonId: this.lessonId,
          timestampSeconds: this.getTimestamp?.() ?? 0,
          content: content.slice(0, NOTE_MAX),
        })
        reply.savedAsNote = true
        this.remember()
        this.$emit('note-saved', note)
        toast.success('Saved to your notes for this lesson.')
      } catch (error) {
        console.error(error)
        toast.error('Could not save that to your notes.')
      } finally {
        this.savingIndex = null
      }
    },
    /** Per-browser convenience only; storage can be unavailable (private mode), so never rely on it. */
    remember() {
      try {
        const kept = this.messages
          .filter((m) => !m.streaming)
          .slice(-REMEMBERED_MESSAGES)
          .map(({ role, content, error, savedAsNote }) => ({ role, content, error, savedAsNote }))
        if (kept.length) localStorage.setItem(this.storageKey, JSON.stringify(kept))
        else localStorage.removeItem(this.storageKey)
      } catch {
        // Nothing to do — the chat just won't survive a refresh.
      }
    },
    restore() {
      try {
        const saved = JSON.parse(localStorage.getItem(this.storageKey) || '[]')
        if (Array.isArray(saved)) {
          this.messages = saved.filter(
            (m) => m && ['user', 'assistant', 'divider'].includes(m.role) && typeof m.content === 'string',
          )
        }
      } catch {
        this.messages = []
      }
    },
    scrollToBottom(force = false) {
      this.$nextTick(() => {
        const el = this.$refs.scrollArea
        if (!el) return
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_TO_BOTTOM_PX
        if (force || nearBottom) el.scrollTop = el.scrollHeight
      })
    },
  },
}
</script>

<style scoped>
.reply-action {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border-radius: 9999px;
  padding: 0.25rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--muted-foreground);
  transition: background-color 0.15s, color 0.15s;
}
.reply-action:hover:not(:disabled) {
  background: rgb(124 58 237 / 0.08);
  color: var(--foreground);
}
.reply-action:disabled {
  cursor: default;
  opacity: 0.7;
}

.tutor-reply :deep(p + p),
.tutor-reply :deep(p + ul),
.tutor-reply :deep(p + ol),
.tutor-reply :deep(ul + p),
.tutor-reply :deep(ol + p),
.tutor-reply :deep(pre) {
  margin-top: 0.6rem;
}
.tutor-reply :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
}
.tutor-reply :deep(ol) {
  list-style: decimal;
  padding-left: 1.25rem;
}
.tutor-reply :deep(li + li) {
  margin-top: 0.2rem;
}
.tutor-reply :deep(code) {
  border-radius: 6px;
  background: rgb(124 58 237 / 0.12);
  padding: 0.05rem 0.35rem;
  font-size: 0.85em;
}
.tutor-reply :deep(pre) {
  overflow-x: auto;
  border-radius: 12px;
  background: #0e1626;
  padding: 0.75rem 0.9rem;
  color: #e2e8f0;
}
.tutor-reply :deep(pre code) {
  background: none;
  padding: 0;
}

.typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: currentColor;
  opacity: 0.4;
  animation: typing 1s infinite ease-in-out;
}
.typing-dot:nth-child(2) {
  animation-delay: 0.15s;
}
.typing-dot:nth-child(3) {
  animation-delay: 0.3s;
}
@keyframes typing {
  0%,
  80%,
  100% {
    opacity: 0.25;
    transform: translateY(0);
  }
  40% {
    opacity: 0.9;
    transform: translateY(-3px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .typing-dot {
    animation: none;
  }
}
</style>
