<template>
  <transition name="back-to-top">
    <button
      v-if="visible"
      class="back-to-top glass-panel hover-lift grid size-12 place-items-center rounded-full"
      aria-label="Back to top"
      @click="scrollTop"
    >
      <app-icon name="lucide:arrow-up" size="22" />
    </button>
  </transition>
</template>

<script>
import AppIcon from '@/components/ui/AppIcon.vue'

export default {
  name: 'BackToTop',
  components: { AppIcon },
  data() {
    return { visible: false }
  },
  mounted() {
    window.addEventListener('scroll', this.onScroll, { passive: true })
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    onScroll() {
      this.visible = window.scrollY > 480
    },
    scrollTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}
</script>
