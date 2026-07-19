<template>
  <v-card class="glass-panel section-card pa-6 text-center" flat>
    <div class="eyebrow mb-4 d-inline-flex">🎓 Certificate earned</div>
    <div class="cert-frame mb-5">
      <canvas ref="canvas" width="4000" height="2800" class="cert-canvas"></canvas>
    </div>
    <div class="d-flex justify-center gap-4 flex-wrap">
      <v-btn class="btn-gradient" @click="downloadPNG">
        <v-icon start>mdi-image</v-icon> Download Image (PNG)
      </v-btn>
      <v-btn class="btn-gradient-secondary" @click="downloadPDF">
        <v-icon start>mdi-file-pdf-box</v-icon> Download Document (PDF)
      </v-btn>
    </div>
  </v-card>
</template>

<script>
import { jsPDF } from 'jspdf'

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
      
      // Reset transform and clear for high-DPI redraw
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const W = 1000
      const H = 700
      ctx.scale(4, 4)

      // 1. Premium Textured Background
      ctx.fillStyle = '#fafaf9'
      ctx.fillRect(0, 0, W, H)

      // Fine Guilloche Security Watermark Pattern
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.025)'
      ctx.lineWidth = 1
      for (let i = -100; i < H + 200; i += 28) {
        ctx.beginPath()
        for (let j = 0; j < W; j += 15) {
          const yOffset = Math.sin(j * 0.004) * 45 + Math.cos((j + i) * 0.002) * 20
          if (j === 0) ctx.moveTo(j, i + yOffset)
          else ctx.lineTo(j, i + yOffset)
        }
        ctx.stroke()
      }

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

      // Top Left / Right Corner Banners (Metadata)
      // Top Left Capsule
      ctx.fillStyle = '#f8fafc'
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 1
      this.drawRoundedRect(ctx, 80, 80, 140, 24, 12)
      ctx.fill()
      ctx.stroke()
      
      ctx.fillStyle = '#475569'
      ctx.font = 'bold 9px "Plus Jakarta Sans", Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('🔒 SECURE DOCUMENT', 150, 95)

      // Top Right Capsule
      ctx.fillStyle = '#f8fafc'
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 1
      this.drawRoundedRect(ctx, W - 220, 80, 140, 24, 12)
      ctx.fill()
      ctx.stroke()
      
      ctx.fillStyle = '#475569'
      ctx.font = 'bold 9px "Plus Jakarta Sans", Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('⭐ OFFICIAL CREDENTIAL', W - 150, 95)

      ctx.textAlign = 'center'

      // Vector Brand Logo (School cap) at top center
      this.drawLogo(ctx, center, 94)

      // 5. Brand Header
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 24px "Plus Jakarta Sans", Arial, sans-serif'
      ctx.fillText('ONLINE PATHSHALA', center, 144)

      ctx.fillStyle = '#64748b'
      ctx.font = 'bold 11px "Plus Jakarta Sans", Arial, sans-serif'
      ctx.fillText('GLOBAL ACADEMY OF DIGITAL EXCELLENCE', center, 160)

      // 6. Decorative Ribbon
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(center - 150, 178)
      ctx.lineTo(center + 150, 178)
      ctx.stroke()

      // 7. Certificate Title
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 46px "Plus Jakarta Sans", Arial, sans-serif'
      ctx.fillText('Certificate of Completion', center, 244)

      ctx.fillStyle = '#64748b'
      ctx.font = 'italic 20px Georgia, serif'
      ctx.fillText('This certifies that the candidate', center, 300)

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
      ctx.fillText(`Granted on ${this.today()}`, center, 530)
      ctx.fillText(`Certificate ID: ${this.certId}`, center, 548)

      // 11. Verification Seal (Gold Circular Badge) - Placed at bottom-left
      this.drawSeal(ctx, 130, 545)

      // 12. Instructor & Director Signatures - Shifted to center
      // Instructor
      ctx.fillStyle = '#0f172a'
      ctx.font = 'italic 26px "Georgia", cursive'
      ctx.fillText(this.instructor, 330, 580)
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(230, 590)
      ctx.lineTo(430, 590)
      ctx.stroke()
      ctx.fillStyle = '#64748b'
      ctx.font = '11px "Plus Jakarta Sans", Arial, sans-serif'
      ctx.fillText('INSTRUCTOR SIGNATURE', 330, 606)

      // Director (Vimlesh Kumar)
      ctx.fillStyle = '#0f172a'
      ctx.font = 'italic 26px "Georgia", cursive'
      ctx.fillText('Vimlesh Kumar', 570, 580)
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(470, 590)
      ctx.lineTo(670, 590)
      ctx.stroke()
      ctx.fillStyle = '#64748b'
      ctx.font = '11px "Plus Jakarta Sans", Arial, sans-serif'
      ctx.fillText('DIRECTOR SIGNATURE', 570, 606)

      // 13. Dynamic QR Code for World-Wide Verification - Placed at bottom-right
      const qrImg = new Image()
      qrImg.crossOrigin = 'anonymous'
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://online-pathshala.com/verify/${this.certId}`
      qrImg.onload = () => {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(780, 495, 110, 110)
        ctx.drawImage(qrImg, 785, 500, 100, 100)
        ctx.fillStyle = '#64748b'
        ctx.font = '9px Arial, sans-serif'
        ctx.fillText('SCAN TO VALIDATE', 835, 620)
      }

      // 14. Fine print/legal footer at the bottom
      ctx.fillStyle = '#94a3b8'
      ctx.font = '8px "Plus Jakarta Sans", Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('This document is electronically signed and secure. Verify authenticity online via QR code or registration ID.', center, 642)
    },
    drawRoundedRect(ctx, x, y, width, height, radius) {
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + width - radius, y)
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
      ctx.lineTo(x + width, y + height - radius)
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
      ctx.lineTo(x + radius, y + height)
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
    },
    drawCornerOrnament(ctx, x, y, size) {
      ctx.strokeStyle = '#d97706'
      ctx.lineWidth = 2
      // Outer ornament circle
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.stroke()

      // Inner concentric circle
      ctx.beginPath()
      ctx.arc(x, y, size - 6, 0, Math.PI * 2)
      ctx.stroke()

      // Corner line flourishes extending along borders
      ctx.lineWidth = 1
      const xDir = x < 500 ? 1 : -1
      const yDir = y < 350 ? 1 : -1

      ctx.beginPath()
      ctx.moveTo(x + xDir * size, y)
      ctx.lineTo(x + xDir * (size + 30), y)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(x, y + yDir * size)
      ctx.lineTo(x, y + yDir * (size + 30))
      ctx.stroke()
    },
    drawSeal(ctx, x, y) {
      ctx.save()
      ctx.translate(x, y)
      
      // Draw hanging ribbons behind the gold seal
      ctx.fillStyle = '#dc2626' // Red ribbon 1
      ctx.beginPath()
      ctx.moveTo(-12, 20)
      ctx.lineTo(-24, 80)
      ctx.lineTo(-8, 72)
      ctx.lineTo(6, 80)
      ctx.lineTo(-2, 20)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = '#b91c1c' // Darker red ribbon 2 for depth
      ctx.beginPath()
      ctx.moveTo(2, 20)
      ctx.lineTo(6, 80)
      ctx.lineTo(18, 72)
      ctx.lineTo(26, 80)
      ctx.lineTo(12, 20)
      ctx.closePath()
      ctx.fill()

      // Main gold seal
      ctx.fillStyle = '#f59e0b'
      ctx.beginPath()
      ctx.arc(0, 0, 44, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#d97706'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(0, 0, 38, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 32px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('★', 0, -2)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 8px Arial'
      ctx.fillText('VERIFIED', 0, 18)
      ctx.fillText('VALID CERT', 0, -18)

      ctx.restore()
    },
    drawLogo(ctx, x, y) {
      ctx.save()
      ctx.translate(x, y)

      // Draw gold laurel wreath/branches around the central shield
      ctx.strokeStyle = '#d97706'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(-22, 2, 16, 0.5 * Math.PI, 1.8 * Math.PI)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(22, 2, 16, 1.2 * Math.PI, 0.5 * Math.PI)
      ctx.stroke()

      // Central dark indigo shield
      ctx.fillStyle = '#1e1b4b'
      ctx.beginPath()
      ctx.moveTo(-14, -16)
      ctx.lineTo(14, -16)
      ctx.lineTo(14, 2)
      ctx.quadraticCurveTo(14, 16, 0, 22)
      ctx.quadraticCurveTo(-14, 16, -14, 2)
      ctx.closePath()
      ctx.fill()

      // Shield gold border
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // White graduation cap inside shield
      ctx.fillStyle = '#ffffff'
      
      // Cap skull/base
      ctx.beginPath()
      ctx.moveTo(-6, 5)
      ctx.bezierCurveTo(-6, 10, 6, 10, 6, 5)
      ctx.lineTo(6, 3)
      ctx.lineTo(-6, 3)
      ctx.closePath()
      ctx.fill()

      // Cap top diamond
      ctx.beginPath()
      ctx.moveTo(0, -5)
      ctx.lineTo(10, 0)
      ctx.lineTo(0, 5)
      ctx.lineTo(-10, 0)
      ctx.closePath()
      ctx.fill()

      // Cap tassel
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, -1)
      ctx.lineTo(-7, 2)
      ctx.lineTo(-7, 7)
      ctx.stroke()

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
    downloadPNG() {
      const canvas = this.$refs.canvas
      const link = document.createElement('a')
      link.download = `online-pathshala-certificate-${this.certId}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    },
    downloadPDF() {
      const canvas = this.$refs.canvas
      const imgData = canvas.toDataURL('image/png', 1.0)
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [4000, 2800]
      })
      doc.addImage(imgData, 'PNG', 0, 0, 4000, 2800)
      doc.save(`online-pathshala-certificate-${this.certId}.pdf`)
    }
  }
}
</script>

<style scoped>
.cert-frame { display: flex; justify-content: center; }
.cert-canvas {
  width: 100%;
  max-width: 100%;
  height: auto;
  border-radius: var(--r-md);
  box-shadow: var(--shadow-lg);
  display: block;
}
.btn-gradient-secondary {
  background: var(--grad-accent) !important;
  color: #fff !important;
  border: none !important;
  box-shadow: 0 10px 25px rgba(244, 63, 94, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}
.btn-gradient-secondary:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
  box-shadow: 0 20px 45px rgba(244, 63, 94, 0.35);
}
.gap-4 {
  gap: 16px;
}
</style>
