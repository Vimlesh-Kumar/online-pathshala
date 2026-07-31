<template>
  <div class="toast-stack">
    <transition-group name="toast-pop">
      <div v-for="t in toasts" :key="t.id" class="toast-item glass-panel" :class="t.type">
        <app-icon :name="icon(t.type)" size="20" class="mr-2 toast-icon" />
        <span class="toast-text">{{ t.message }}</span>
        <button
          class="ml-2 grid size-6 shrink-0 place-items-center rounded-full transition-colors hover:bg-foreground/10"
          aria-label="Dismiss"
          @click="toast.remove(t.id)"
        >
          <app-icon name="lucide:x" size="16" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { toast, useToastState } from '@/plugins/toast'
import AppIcon from '@/components/ui/AppIcon.vue'

export default {
  name: 'ToastStack',
  components: { AppIcon },
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
      if (type === 'success') return 'lucide:circle-check'
      if (type === 'error') return 'lucide:circle-alert'
      return 'lucide:info'
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

.toast-item.success .toast-icon { color: #22c55e; }
.toast-item.error .toast-icon { color: #ef4444; }
.toast-item.info .toast-icon { color: var(--brand-2); }

.toast-text {
  flex-grow: 1;
  line-height: 1.35;
}

.toast-pop-enter-active, .toast-pop-leave-active { transition: all 0.25s ease; }
.toast-pop-enter-from, .toast-pop-leave-to { opacity: 0; transform: translateX(30px); }
.toast-pop-leave-active { position: absolute; }
</style>
