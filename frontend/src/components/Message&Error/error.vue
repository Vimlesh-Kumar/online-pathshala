<template>
  <!-- Error Handled for username & password -->
  <div
    v-if="error"
    class="mb-5 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    role="alert"
  >
    <app-icon name="lucide:triangle-alert" size="18" class="mt-0.5 shrink-0" />
    <span>{{ error }}</span>
  </div>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'

export default {
  name: 'Error',
  components: { AppIcon },
  props: ['error']
}
</script>
