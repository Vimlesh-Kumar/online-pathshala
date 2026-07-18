<template>
  <v-card class="glass-panel section-card pa-6 text-center" flat>
    <div class="eyebrow mb-4 d-inline-flex">🎓 Certificate earned</div>
    <div class="cert-frame mb-5">
      <canvas ref="canvas" width="1000" height="700" class="cert-canvas"></canvas>
    </div>
    <v-btn class="btn-gradient" @click="download">
      <v-icon start>mdi-download</v-icon> Download certificate
    </v-btn>
  </v-card>
</template>

<script>
export default {
  name: 'CourseCertificate',
  props: {
    name: { type: String, default: 'Student' },
    course: { type: String, default: '' },
  },
  mounted() {
    this.draw()
  },
  methods: {
    draw() {
      const canvas = this.$refs.canvas
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const W = canvas.width
      const H = canvas.height

      // Background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, W, H)

      // Gradient border
      const grad = ctx.createLinearGradient(0, 0, W, H)
      grad.addColorStop(0, '#7c3aed')
      grad.addColorStop(0.5, '#6366f1')
      grad.addColorStop(1, '#06b6d4')
      ctx.strokeStyle = grad
      ctx.lineWidth = 14
      ctx.strokeRect(28, 28, W - 56, H - 56)
      ctx.lineWidth = 2
      ctx.strokeRect(50, 50, W - 100, H - 100)

      const center = W / 2
      ctx.textAlign = 'center'

      // Brand
      ctx.fillStyle = '#6366f1'
      ctx.font = 'bold 30px "Plus Jakarta Sans", Arial, sans-serif'
      ctx.fillText('ONLINE PATHSHALA', center, 130)

      // Title
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 54px "Plus Jakarta Sans", Arial, sans-serif'
      ctx.fillText('Certificate of Completion', center, 220)

      ctx.fillStyle = '#64748b'
      ctx.font = '22px Arial, sans-serif'
      ctx.fillText('This certifies that', center, 300)

      // Name
      ctx.fillStyle = grad
      ctx.font = 'bold 58px "Plus Jakarta Sans", Arial, sans-serif'
      ctx.fillText(this.name, center, 380)

      ctx.fillStyle = '#64748b'
      ctx.font = '22px Arial, sans-serif'
      ctx.fillText('has successfully completed the course', center, 440)

      // Course
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 34px "Plus Jakarta Sans", Arial, sans-serif'
      this.wrap(ctx, this.course, center, 500, 820, 42)

      // Date + signature line
      ctx.fillStyle = '#94a3b8'
      ctx.font = '20px Arial, sans-serif'
      ctx.fillText(this.today(), center, 620)
    },
    wrap(ctx, text, x, y, maxWidth, lineHeight) {
      const words = String(text).split(' ')
      let line = ''
      let cursorY = y
      for (const word of words) {
        const test = line ? `${line} ${word}` : word
        if (ctx.measureText(test).width > maxWidth && line) {
          ctx.fillText(line, x, cursorY)
          line = word
          cursorY += lineHeight
        } else {
          line = test
        }
      }
      ctx.fillText(line, x, cursorY)
    },
    today() {
      return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    },
    download() {
      const canvas = this.$refs.canvas
      const link = document.createElement('a')
      link.download = `pathshala-certificate-${this.course.replace(/\s+/g, '-').toLowerCase()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    },
  },
}
</script>

<style scoped>
.cert-frame { display: flex; justify-content: center; }
.cert-canvas {
  width: 100%;
  max-width: 640px;
  height: auto;
  border-radius: var(--r-md);
  box-shadow: var(--shadow-md);
}
</style>
