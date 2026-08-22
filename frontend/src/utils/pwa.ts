import { ref, readonly } from 'vue'

/**
 * PWA glue: service-worker registration, install prompt and online state.
 *
 * The worker itself lives in `public/sw.js` (plain JS, served from the root so
 * its scope covers the whole app). This module is the only place the page talks
 * to it from.
 */

/** Chrome fires this before showing its own install UI; capturing it lets us prompt at a better moment. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const online = ref(navigator.onLine)
const installable = ref(false)
const updateReady = ref(false)

let deferredPrompt: BeforeInstallPromptEvent | null = null
let waitingWorker: ServiceWorker | null = null

/** Reactive online/offline state, shared by every component that needs it. */
export const useOnlineState = () => readonly(online)
/** True once the browser has offered an install prompt we captured. */
export const useInstallState = () => ({ installable: readonly(installable), updateReady: readonly(updateReady) })

/**
 * Show the browser's install dialog.
 * Returns true when the user accepted; the prompt can only be used once.
 */
export const promptInstall = async (): Promise<boolean> => {
  if (!deferredPrompt) return false

  await deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  installable.value = false
  return outcome === 'accepted'
}

/** Activate a waiting service worker and reload onto the new version. */
export const applyUpdate = () => {
  if (!waitingWorker) {
    window.location.reload()
    return
  }
  waitingWorker.postMessage('skip-waiting')
}

/**
 * Drop every cached API response.
 *
 * API responses are per-learner, so this must run on logout — otherwise the
 * next person to use the device could be served the previous learner's data
 * from cache while offline.
 */
export const clearApiCache = async () => {
  if (!('caches' in window)) return
  try {
    const keys = await caches.keys()
    await Promise.all(keys.filter((key) => key.startsWith('pathshala-api')).map((key) => caches.delete(key)))
  } catch (error) {
    console.error('Could not clear the offline cache:', error)
  }
}

/** Register the service worker and start tracking install/online state. */
export const setupPwa = () => {
  window.addEventListener('online', () => { online.value = true })
  window.addEventListener('offline', () => { online.value = false })

  window.addEventListener('beforeinstallprompt', (event) => {
    // Suppress the mini-infobar so the in-app prompt is the only one shown.
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    installable.value = true
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    installable.value = false
  })

  if (!('serviceWorker' in navigator)) return
  // A worker in dev would serve stale modules and fight Vite's HMR.
  if (!import.meta.env.PROD) return

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')

      // A worker already waiting means the page was loaded from the old version.
      if (registration.waiting) {
        waitingWorker = registration.waiting
        updateReady.value = true
      }

      registration.addEventListener('updatefound', () => {
        const installing = registration.installing
        if (!installing) return

        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            waitingWorker = installing
            updateReady.value = true
          }
        })
      })

      // The new worker took over — reload once so the page matches its assets.
      let reloading = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloading) return
        reloading = true
        window.location.reload()
      })
    } catch (error) {
      console.error('Service worker registration failed:', error)
    }
  })
}
