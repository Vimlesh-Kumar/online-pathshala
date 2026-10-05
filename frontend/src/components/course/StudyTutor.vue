<template>
  <div class="glass-panel section-card p-6">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <span
          class="grid size-10 shrink-0 place-items-center rounded-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] text-white shadow-[0_10px_26px_-12px_rgb(124_58_237_/_0.9)]"
        >
          <app-icon name="lucide:sparkles" size="19" />
        </span>
        <div class="min-w-0">
          <div class="eyebrow mb-0.5">AI study tutor</div>
          <p class="truncate text-xs text-muted-foreground">
            {{ lessonName ? `Ask anything about “${lessonName}”` : 'Ask anything about this course' }}
          </p>
        </div>
      </div>
      <button
        v-if="messages.length"
        class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        @click="newChat"
      >
        <app-icon name="lucide:rotate-ccw" size="14" /> New chat
      </button>
    </div>

    <!-- Starter prompts -->
    <div v-if="!messages.length" class="mb-4 flex flex-wrap gap-2">
      <button
        v-for="prompt in starters"
        :key="prompt.label"
        class="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-1.5 text-left text-sm transition-colors hover:border-primary/50 hover:bg-primary/5 dark:border-white/12"
        @click="send(prompt.text)"
      >
        <app-icon :name="prompt.icon" size="15" class="text-primary" /> {{ prompt.label }}
      </button>
    </div>

    <!-- Conversation -->
    <div
      v-else
      ref="scrollArea"
      class="mb-4 flex max-h-[28rem] flex-col gap-3 overflow-y-auto pr-1"
      aria-live="polite"
    >
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
        <div v-else class="flex justify-start">
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
        placeholder="Ask a question, or ask to be quizzed…"
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
      AI can make mistakes — double-check anything important. Enter to send, Shift+Enter for a new line.
    </p>
  </div>
</template>

<script>
import AppField from '@/components/ui/AppField.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { renderMiniMarkdown } from '@/utils/miniMarkdown'

/** Only follow new text down if the learner hasn't scrolled up to reread. */
const STICK_TO_BOTTOM_PX = 80

export default {
  name: 'StudyTutor',
  components: { AppField, AppIcon },
  props: {
    courseId: { type: Number, required: true },
    lessonId: { type: Number, default: null },
    lessonName: { type: String, default: '' },
  },
  data() {
    return {
      input: '',
      // { role: 'user' | 'assistant' | 'divider', content, streaming?, error? }
      messages: [],
      streaming: false,
      controller: null,
      starters: [
        { label: 'Explain this simply', icon: 'lucide:lightbulb', text: 'Explain the main idea of this lesson simply, like I am a beginner.' },
        { label: 'Real-world example', icon: 'lucide:globe', text: 'Give me a real-world example of what this lesson teaches.' },
        { label: 'Quiz me', icon: 'lucide:circle-help', text: 'Quiz me on this lesson. Ask one question at a time.' },
        { label: 'What comes before this?', icon: 'lucide:route', text: 'What should I already understand before this lesson?' },
      ],
    }
  },
  watch: {
    // Mark the switch so earlier answers read as being about the old lesson.
    lessonId(newId, oldId) {
      if (newId !== oldId && this.messages.length && this.lessonName) {
        this.messages.push({ role: 'divider', content: this.lessonName })
        this.scrollToBottom(true)
      }
    },
  },
  beforeUnmount() {
    this.controller?.abort()
  },
  methods: {
    render: renderMiniMarkdown,
    async send(preset) {
      const text = (preset ?? this.input).trim()
      if (!text || this.streaming) return

      // Only real exchanges go upstream — dividers and error bubbles are UI-only.
      const history = this.messages
        .filter((m) => (m.role === 'user' || m.role === 'assistant') && !m.error && m.content)
        .map((m) => ({ role: m.role, content: m.content }))
      history.push({ role: 'user', content: text })

      this.messages.push({ role: 'user', content: text })
      const reply = { role: 'assistant', content: '', streaming: true, error: false }
      this.messages.push(reply)
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
        if (error?.name === 'AbortError') {
          if (!target.content) target.content = '_(Stopped.)_'
        } else {
          console.error(error)
          target.error = true
          target.content =
            error?.status === 403
              ? 'Please sign in again to use the tutor.'
              : error?.message || 'The tutor is unavailable right now. Please try again.'
        }
      } finally {
        if (this.messages[replyIndex]) this.messages[replyIndex].streaming = false
        this.streaming = false
        this.controller = null
        this.scrollToBottom()
      }
    },
    stop() {
      this.controller?.abort()
    },
    newChat() {
      this.controller?.abort()
      this.messages = []
      this.input = ''
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
</style>
