/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import router from '../router'
import { registerScrollReveal } from './scrollReveal'
import { registerIcons } from './icons'

// Types
import type { App } from 'vue'

export function registerPlugins (app: App) {
  registerIcons()
  app.use(router)
  registerScrollReveal(app)
}
