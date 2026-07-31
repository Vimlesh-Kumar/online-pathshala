<template>
  <svg class="progress-ring" :width="size" :height="size" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="pr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#7c3aed" />
        <stop offset="50%" stop-color="#6366f1" />
        <stop offset="100%" stop-color="#06b6d4" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" :r="radius" fill="none" :stroke="trackColor" :stroke-width="strokeWidth" />
    <circle
      cx="50" cy="50" :r="radius" fill="none" :stroke="color" :stroke-width="strokeWidth"
      stroke-linecap="round" :stroke-dasharray="circumference" :stroke-dashoffset="offset"
      transform="rotate(-90 50 50)"
    />
    <text x="50" y="55" text-anchor="middle" class="progress-ring-text" :style="{ fontSize: labelSize }">{{ Math.round(value) }}%</text>
  </svg>
</template>

<script>
export default {
  name: 'ProgressRing',
  props: {
    value: { type: Number, default: 0 },
    size: { type: Number, default: 64 },
    strokeWidth: { type: Number, default: 9 },
    color: { type: String, default: 'url(#pr-grad)' },
    trackColor: { type: String, default: 'var(--glass-border)' },
    labelSize: { type: String, default: '20px' }
  },
  computed: {
    radius() {
      return 50 - this.strokeWidth
    },
    circumference() {
      return 2 * Math.PI * this.radius
    },
    offset() {
      const pct = Math.max(0, Math.min(100, this.value))
      return this.circumference * (1 - pct / 100)
    }
  }
}
</script>

<style scoped>
.progress-ring-text {
  fill: var(--text-strong);
  font-weight: 800;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
</style>
