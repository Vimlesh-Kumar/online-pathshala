<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-4 z-[4000] flex flex-col items-center gap-2 px-4">
    <!-- Offline -->
    <transition name="status-slide">
      <div
        v-if="!online"
        class="pointer-events-auto flex items-center gap-3 rounded-full border border-amber-500/30 bg-amber-500/15 px-5 py-2.5 text-sm font-semibold text-amber-600 shadow-lg backdrop-blur-xl dark:text-amber-400"
      >
        <app-icon name="lucide:wifi-off" size="18" />
        You are offline — pages you have already opened still work.
      </div>
    </transition>

    <!-- New version -->
    <transition name="status-slide">
      <div
        v-if="updateReady"
        class="pointer-events-auto flex items-center gap-3 rounded-full border border-black/5 bg-white/80 px-5 py-2.5 text-sm font-semibold shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80"
      >
        <app-icon name="lucide:refresh-cw" size="18" class="text-primary" />
        A new version is ready.
        <button class="font-bold text-primary underline-offset-2 hover:underline" @click="applyUpdate">
          Reload
        </button>
      </div>
    </transition>

    <!-- Install -->
    <transition name="status-slide">
      <div
        v-if="showInstall"
        class="pointer-events-auto flex items-center gap-3 rounded-full border border-black/5 bg-white/80 px-5 py-2.5 text-sm shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80"
      >
        <app-icon name="lucide:download" size="18" class="text-primary" />
        <span class="font-semibold">Install Pathshala for offline learning</span>
        <button class="font-bold text-primary underline-offset-2 hover:underline" @click="install">
          Install
        </button>
        <button
          class="text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Dismiss install prompt"
          @click="dismiss"
        >
          <app-icon name="lucide:x" size="16" />
        </button>
      </div>
    </transition>
  </div>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'
import { useOnlineState, useInstallState, promptInstall, applyUpdate } from '@/utils/pwa'
import { toast } from '@/plugins/toast'

/** Remembers a dismissal so the prompt does not reappear on every page load. */
const DISMISS_KEY = 'pathshala:install-dismissed'

export default {
  name: 'AppStatusBar',
  components: { AppIcon },
  setup() {
    const { installable, updateReady } = useInstallState()
    return { online: useOnlineState(), installable, updateReady, applyUpdate }
  },
  data() {
    return { dismissed: localStorage.getItem(DISMISS_KEY) === 'true' }
  },
  computed: {
    showInstall() {
      return this.installable && !this.dismissed && this.online
    }
  },
  methods: {
    async install() {
      const accepted = await promptInstall()
      if (accepted) toast.success('Pathshala installed — look for it on your home screen.')
    },
    dismiss() {
      this.dismissed = true
      localStorage.setItem(DISMISS_KEY, 'true')
    }
  }
}
</script>

<style scoped>
.status-slide-enter-active,
.status-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.status-slide-enter-from,
.status-slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
