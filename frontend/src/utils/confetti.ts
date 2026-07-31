const COLORS = ['#7c3aed', '#6366f1', '#06b6d4', '#f43f5e', '#f59e0b']

export function fireConfetti(durationMs = 1600) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.inset = '0'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '5000'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)

  const context = canvas.getContext('2d')
  if (!context) {
    canvas.remove()
    return
  }
  const ctx: CanvasRenderingContext2D = context

  const pieces = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.3,
    w: 6 + Math.random() * 6,
    h: 8 + Math.random() * 10,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    vx: (Math.random() - 0.5) * 4,
    vy: 2 + Math.random() * 4,
    rotation: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3
  }))

  const start = performance.now()

  function frame(now: number) {
    const elapsed = now - start
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const p of pieces) {
      p.x += p.vx
      p.y += p.vy
      p.rotation += p.vr
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    }
    if (elapsed < durationMs) {
      requestAnimationFrame(frame)
    } else {
      canvas.remove()
    }
  }
  requestAnimationFrame(frame)
}
