<template>
  <transition name="back-to-top">
    <v-btn
      v-if="visible"
      icon
      size="large"
      class="back-to-top glass-panel hover-lift"
      variant="flat"
      @click="scrollTop"
    >
      <v-icon>mdi-arrow-up</v-icon>
    </v-btn>
  </transition>
</template>

<script>
export default {
  name: 'BackToTop',
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
