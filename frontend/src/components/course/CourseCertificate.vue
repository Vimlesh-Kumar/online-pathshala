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
    instructor: { type: String, default: 'Instructor' },
    propCertId: { type: String, default: '' }
  },
  data() {
    return {
      certId: ''
    }
  },
  created() {
    if (this.propCertId) {
      this.certId = this.propCertId
    } else {
      // Generate a unique validation ID based on user name, course, and date
      const str = `${this.name}-${this.course}-${this.today()}`;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
      this.certId = `OP-${hex.substring(0, 4)}-${hex.substring(4, 8)}`;
    }
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

      // 1. Premium Textured Background
      ctx.fillStyle = '#fafaf9'
      ctx.fillRect(0, 0, W, H)

      // Faint central watermark logo
      ctx.fillStyle = '#f1f5f9'
      ctx.font = 'bold 180px "Plus Jakarta Sans", Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('OP', W / 2, H / 2 + 60)

      // 2. Thick Outer Border
      ctx.strokeStyle = '#0f172a'
      ctx.lineWidth = 14
      ctx.strokeRect(28, 28, W - 56, H - 56)

      // 3. Inner Gold Border
      ctx.strokeStyle = '#d97706'
      ctx.lineWidth = 2
      ctx.strokeRect(48, 48, W - 96, H - 96)

      // 4. Corner Ornaments
      this.drawCornerOrnament(ctx, 48, 48, 20)
      this.drawCornerOrnament(ctx, W - 48, 48, 20)
      this.drawCornerOrnament(ctx, 48, H - 48, 20)
      this.drawCornerOrnament(ctx, W - 48, H - 48, 20)

      const center = W / 2
      ctx.textAlign = 'center'

      // 5. Brand Header
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 26px "Plus Jakarta Sans", Arial, sans-serif'
      ctx.fillText('ONLINE PATHSHALA', center, 110)

      ctx.fillStyle = '#64748b'
      ctx.font = 'bold 12px "Plus Jakarta Sans", Arial, sans-serif'
      ctx.fillText('GLOBAL ACADEMY OF DIGITAL EXCELLENCE', center, 130)

      // 6. Decorative Ribbon
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(center - 150, 150)
      ctx.lineTo(center + 150, 150)
      ctx.stroke()

      // 7. Certificate Title
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 50px "Plus Jakarta Sans", Arial, sans-serif'
      ctx.fillText('Certificate of Completion', center, 220)

      ctx.fillStyle = '#64748b'
      ctx.font = 'italic 20px Georgia, serif'
      ctx.fillText('This certifies that the candidate', center, 285)

      // 8. Student Name
      const nameGrad = ctx.createLinearGradient(0, 0, W, 0)
      nameGrad.addColorStop(0.3, '#4f46e5')
      nameGrad.addColorStop(0.7, '#7c3aed')
      ctx.fillStyle = nameGrad
      ctx.font = 'bold 54px "Plus Jakarta Sans", Arial, sans-serif'
      ctx.fillText(this.name, center, 360)

      ctx.fillStyle = '#64748b'
      ctx.font = 'italic 20px Georgia, serif'
      ctx.fillText('has successfully met all curriculum requirements and completed the course', center, 420)

      // 9. Course Name
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 32px "Plus Jakarta Sans", Arial, sans-serif'
      this.wrap(ctx, this.course, center, 480, 820, 38)

      // 10. Date + Verification Info
      ctx.fillStyle = '#64748b'
      ctx.font = '14px Arial, sans-serif'
      ctx.fillText(`Granted on ${this.today()}`, center, 560)
      ctx.fillText(`Certificate ID: ${this.certId}`, center, 585)

      // 11. Verification Seal (Gold Circular Badge)
      this.drawSeal(ctx, 160, 545)

      // 12. Instructor & Director Signatures
      // Instructor
      ctx.fillStyle = '#0f172a'
      ctx.font = 'italic 28px "Georgia", cursive'
      ctx.fillText(this.instructor, 500, 630)
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(400, 640)
      ctx.lineTo(600, 640)
      ctx.stroke()
      ctx.fillStyle = '#64748b'
      ctx.font = '12px "Plus Jakarta Sans", Arial, sans-serif'
      ctx.fillText('INSTRUCTOR SIGNATURE', 500, 655)

      // Director (Vimlesh Kumar)
      ctx.fillStyle = '#0f172a'
      ctx.font = 'italic 28px "Georgia", cursive'
      ctx.fillText('Vimlesh Kumar', 760, 630)
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(660, 640)
      ctx.lineTo(860, 640)
      ctx.stroke()
      ctx.fillStyle = '#64748b'
      ctx.font = '12px "Plus Jakarta Sans", Arial, sans-serif'
      ctx.fillText('DIRECTOR SIGNATURE', 760, 655)

      // 13. Dynamic QR Code for World-Wide Verification
      const qrImg = new Image()
      qrImg.crossOrigin = 'anonymous'
      // Public free QR code API
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://online-pathshala.com/verify/${this.certId}`
      qrImg.onload = () => {
        // Draw the white QR code background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(W - 200, 500, 110, 110)
        // Draw the QR code
        ctx.drawImage(qrImg, W - 195, 505, 100, 100)
        // Label
        ctx.fillStyle = '#64748b'
        ctx.font = '9px Arial, sans-serif'
        ctx.fillText('SCAN TO VALIDATE', W - 145, 625)
      }
    },
    drawCornerOrnament(ctx, x, y, size) {
      ctx.strokeStyle = '#d97706'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.stroke()
    },
    drawSeal(ctx, x, y) {
      // Golden outer seal
      ctx.save()
      ctx.translate(x, y)
      
      ctx.fillStyle = '#f59e0b'
      ctx.beginPath()
      ctx.arc(0, 0, 48, 0, Math.PI * 2)
      ctx.fill()

      // Inner golden border
      ctx.strokeStyle = '#d97706'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, 0, 42, 0, Math.PI * 2)
      ctx.stroke()

      // Star in center
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 36px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('★', 0, -2)

      // Seal text
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 9px Arial'
      ctx.fillText('VERIFIED', 0, 20)
      ctx.fillText('VALID CERT', 0, -20)

      ctx.restore()
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
      link.download = `online-pathshala-certificate-${this.certId}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  }
}
</script>

<style scoped>
.cert-frame { display: flex; justify-content: center; }
.cert-canvas {
  width: 100%;
  max-width: 720px;
  height: auto;
  border-radius: var(--r-md);
  box-shadow: var(--shadow-lg);
}
</style>
