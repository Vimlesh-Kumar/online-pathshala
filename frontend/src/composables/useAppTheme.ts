/**
 * Single source of truth for light/dark.
 *
 * The app is dark-first: `index.html` ships `class="dark"` so there is no
 * flash before hydration, and the stored preference is applied on boot.
 */
import { computed } from 'vue'
import { useStorage } from '@vueuse/core'

type Mode = 'dark' | 'light'

// Same storage key the pre-migration Vuetify toggle used, so existing
// visitors keep the theme they chose.
const mode = useStorage<Mode>('theme', 'dark')

function applyToDocument(value: Mode) {
  // Exactly one of the two classes is always present: the brand tokens key off
  // `.light` while the shadcn tokens key off `.dark`, so a stale or unknown
  // stored value must still resolve to a complete theme rather than a mix.
  const isLight = value === 'light'
  const root = document.documentElement
  root.classList.toggle('light', isLight)
  root.classList.toggle('dark', !isLight)
}

applyToDocument(mode.value)

export function useAppTheme() {
  const isDark = computed(() => mode.value !== 'light')

  function toggleTheme() {
    mode.value = isDark.value ? 'light' : 'dark'
    applyToDocument(mode.value)
  }

  return { isDark, mode, toggleTheme }
}
