<template>
  <div
    class="flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400"
    role="status"
  >
    <app-icon name="lucide:circle-check" size="18" class="mt-0.5 shrink-0" />
    <span>{{ message }}</span>
  </div>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'

export default {
  name: 'Message',
  components: { AppIcon },
  props: ['message']
}
</script>
