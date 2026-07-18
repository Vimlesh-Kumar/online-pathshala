<template>
  <div class="toast-stack">
    <transition-group name="toast-pop">
      <div v-for="t in toasts" :key="t.id" class="toast-item glass-panel" :class="t.type">
        <v-icon size="20" class="mr-2">{{ icon(t.type) }}</v-icon>
        <span class="toast-text">{{ t.message }}</span>
        <v-btn icon size="x-small" variant="text" class="ml-2" @click="toast.remove(t.id)">
          <v-icon size="16">mdi-close</v-icon>
        </v-btn>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { toast, useToastState } from '@/plugins/toast'

export default {
  name: 'ToastStack',
  setup() {
    const state = useToastState()
    return { toast, state }
  },
  computed: {
    toasts() {
      return this.state.toasts
    }
  },
  methods: {
    icon(type) {
      if (type === 'success') return 'mdi-check-circle'
      if (type === 'error') return 'mdi-alert-circle'
      return 'mdi-information'
    }
  }
}
</script>

<style scoped>
.toast-stack {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: min(340px, 88vw);
}

.toast-item {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  border-radius: var(--r-md);
  box-shadow: var(--shadow-lg);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-strong);
}

.toast-item.success .v-icon { color: var(--brand-success, #22c55e); }
.toast-item.error .v-icon { color: var(--brand-error, #ef4444); }
.toast-item.info .v-icon { color: var(--brand-2); }

.toast-text {
  flex-grow: 1;
  line-height: 1.35;
}

.toast-pop-enter-active, .toast-pop-leave-active { transition: all 0.25s ease; }
.toast-pop-enter-from, .toast-pop-leave-to { opacity: 0; transform: translateX(30px); }
.toast-pop-leave-active { position: absolute; }
</style>
