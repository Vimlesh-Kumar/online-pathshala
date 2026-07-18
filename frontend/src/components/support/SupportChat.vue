<template>
  <div class="support-widget">
    <transition name="chat-pop">
      <v-card v-if="open" class="chat-panel glass-panel section-card" flat>
        <div class="chat-header">
          <div class="d-flex align-center">
            <v-avatar size="34" class="chat-avatar mr-3"><v-icon size="18" color="white">mdi-robot-happy-outline</v-icon></v-avatar>
            <div>
              <div class="chat-title">Pathshala Help</div>
              <div class="chat-subtitle">Instant answers, no waiting</div>
            </div>
          </div>
          <v-btn icon size="small" variant="text" @click="open = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <div ref="scrollArea" class="chat-body">
          <div v-for="(msg, i) in messages" :key="i" class="chat-row" :class="msg.from">
            <div class="chat-bubble">{{ msg.text }}</div>
          </div>

          <div v-if="messages.length <= 1" class="quick-questions">
            <div class="text-caption text-medium-emphasis mb-2">Try asking:</div>
            <v-chip
              v-for="q in suggestions" :key="q.id" size="small" class="mb-2 mr-2"
              variant="outlined" @click="ask(q.question)"
            >
              {{ q.question }}
            </v-chip>
          </div>
        </div>

        <div class="chat-input-row">
          <v-text-field
            v-model="input" placeholder="Ask a question…" variant="outlined" density="compact"
            hide-details @keyup.enter="ask()"
          />
          <v-btn icon class="btn-gradient ml-2" :loading="loading" @click="ask()">
            <v-icon>mdi-send</v-icon>
          </v-btn>
        </div>
      </v-card>
    </transition>

    <v-btn icon size="x-large" class="chat-fab btn-gradient" @click="open = !open">
      <v-icon size="28">{{ open ? 'mdi-close' : 'mdi-message-question-outline' }}</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'SupportChat',
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
.chat-avatar { background: rgba(255,255,255,0.2); }
.chat-title { font-weight: 800; font-size: 0.95rem; }
.chat-subtitle { font-size: 0.72rem; opacity: 0.85; }

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

.quick-questions { margin-top: 6px; }

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
