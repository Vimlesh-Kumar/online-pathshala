<template>
  <div class="support-widget">
    <transition name="chat-pop">
      <div v-if="open" class="chat-panel glass-panel section-card">
        <div class="chat-header">
          <div class="flex items-center gap-3">
            <span class="grid size-8.5 place-items-center rounded-full bg-white/20">
              <app-icon name="lucide:bot" size="18" class="text-white" />
            </span>
            <div>
              <div class="text-[0.95rem] font-extrabold">Pathshala Help</div>
              <div class="text-[0.72rem] opacity-85">Instant answers, no waiting</div>
            </div>
          </div>
          <button
            class="grid size-8 place-items-center rounded-full transition-colors hover:bg-white/20"
            aria-label="Close chat"
            @click="open = false"
          >
            <app-icon name="lucide:x" size="18" />
          </button>
        </div>

        <div ref="scrollArea" class="chat-body">
          <div v-for="(msg, i) in messages" :key="i" class="chat-row" :class="msg.from">
            <div class="chat-bubble">{{ msg.text }}</div>
          </div>

          <div v-if="messages.length <= 1" class="mt-1.5">
            <div class="mb-2 text-xs text-muted-foreground">Try asking:</div>
            <button
              v-for="q in suggestions"
              :key="q.id"
              class="mr-2 mb-2 rounded-full border border-black/10 px-3 py-1 text-left text-xs transition-colors hover:border-primary/50 dark:border-white/12"
              @click="ask(q.question)"
            >
              {{ q.question }}
            </button>
          </div>
        </div>

        <div class="chat-input-row">
          <app-field
            v-model="input"
            class="flex-1"
            placeholder="Ask a question…"
            @keyup.enter="ask()"
          />
          <button
            class="ml-2 grid size-12 shrink-0 place-items-center rounded-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] text-white shadow-[0_12px_30px_-12px_rgb(124_58_237_/_0.9)]"
            aria-label="Send"
            :disabled="loading"
            @click="ask()"
          >
            <app-icon
              :name="loading ? 'lucide:loader-circle' : 'lucide:send'"
              size="20"
              :class="loading ? 'animate-spin' : ''"
            />
          </button>
        </div>
      </div>
    </transition>

    <button
      class="chat-fab grid size-14 place-items-center rounded-full bg-linear-135 from-[#7c3aed] via-[#6366f1] to-[#06b6d4] text-white"
      :aria-label="open ? 'Close help chat' : 'Open help chat'"
      @click="open = !open"
    >
      <app-icon :name="open ? 'lucide:x' : 'lucide:message-circle-question-mark'" size="26" />
    </button>
  </div>
</template>

<script>
import AppField from '@/components/ui/AppField.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

export default {
  name: 'SupportChat',
  components: { AppField, AppIcon },
  data() {
    return {
      open: false,
      loading: false,
      input: '',
      suggestions: [],
      messages: [
        { from: 'bot', text: "Hi! I'm the Pathshala help bot. Ask me about enrolling, certificates, checkout, or anything else on the platform." }
      ]
    }
  },
  methods: {
    async ask(preset) {
      const text = (preset ?? this.input).trim()
      if (!text) return
      this.messages.push({ from: 'user', text })
      this.input = ''
      this.loading = true
      this.scrollToBottom()
      try {
        const result = await this.$store.dispatch('askSupport', text)
        this.messages.push({ from: 'bot', text: result.answer })
        this.suggestions = result.suggestions || []
      } catch {
        this.messages.push({ from: 'bot', text: 'Something went wrong — please try again.' })
      } finally {
        this.loading = false
        this.scrollToBottom()
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.scrollArea
        if (el) el.scrollTop = el.scrollHeight
      })
    }
  }
}
</script>

<style scoped>
.support-widget {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.chat-fab {
  box-shadow: var(--shadow-glow);
}

.chat-panel {
  width: min(360px, 90vw);
  height: 480px;
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  border-radius: var(--r-lg);
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--grad-primary);
  color: #fff;
  flex-shrink: 0;
}

.chat-body {
  flex-grow: 1;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--surface);
}

.chat-row { display: flex; }
.chat-row.user { justify-content: flex-end; }
.chat-bubble {
  max-width: 82%;
  padding: 9px 13px;
  border-radius: var(--r-md);
  font-size: 0.88rem;
  line-height: 1.45;
}
.chat-row.bot .chat-bubble {
  background: var(--grad-primary-soft);
  color: var(--text-main);
  border-bottom-left-radius: 4px;
}
.chat-row.user .chat-bubble {
  background: var(--grad-primary);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.chat-input-row {
  display: flex;
  align-items: center;
  padding: 12px;
  border-top: 1px solid var(--glass-border);
  background: var(--surface);
  flex-shrink: 0;
}

.chat-pop-enter-active, .chat-pop-leave-active { transition: all 0.2s ease; }
.chat-pop-enter-from, .chat-pop-leave-to { opacity: 0; transform: translateY(12px) scale(0.97); }
</style>
