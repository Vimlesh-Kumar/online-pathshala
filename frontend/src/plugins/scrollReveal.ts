import type { App, DirectiveBinding } from 'vue'

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed')
        observer.unobserve(entry.target)
      }
    }
  },
  { threshold: 0.15 }
)

export function registerScrollReveal(app: App) {
  app.directive('reveal', {
    mounted(el: HTMLElement, binding: DirectiveBinding) {
      el.classList.add('reveal-init')
      if (binding.value) el.style.transitionDelay = `${binding.value}ms`
      observer.observe(el)
    },
    unmounted(el: HTMLElement) {
      observer.unobserve(el)
    }
  })
}
