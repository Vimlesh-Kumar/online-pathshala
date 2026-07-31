/**
 * Thin wrapper around the YouTube IFrame Player API.
 *
 * Lesson videos are YouTube embeds, and a plain `<iframe>` gives the page no
 * way to read the playhead. Notes need exactly that — "what second am I on?"
 * to stamp a note, and "jump here" to replay it — so the embed is created
 * through the player API instead.
 *
 * Everything degrades gracefully: if the API script is blocked or fails to
 * load, `unavailable` flips to true and the caller falls back to a normal
 * iframe (video still plays, notes are simply saved without a timestamp).
 */
import { onBeforeUnmount, ref } from 'vue'

const API_SRC = 'https://www.youtube.com/iframe_api'

interface YouTubePlayer {
  loadVideoById(options: { videoId: string; startSeconds?: number }): void
  getCurrentTime(): number
  seekTo(seconds: number, allowSeekAhead: boolean): void
  playVideo(): void
  destroy(): void
}

interface YouTubeApi {
  Player: new (
    host: HTMLElement,
    options: {
      videoId: string
      playerVars?: Record<string, string | number>
      events?: { onReady?: () => void }
    },
  ) => YouTubePlayer
}

declare global {
  interface Window {
    YT?: YouTubeApi
    onYouTubeIframeAPIReady?: () => void
  }
}

/** The API script is global to the page — load it at most once, ever. */
let apiPromise: Promise<YouTubeApi> | null = null

function loadApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise

  apiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    // The API calls this global hook once it has finished booting. Chain any
    // existing hook so we never clobber another consumer.
    const previousHook = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousHook?.()
      if (window.YT?.Player) resolve(window.YT)
      else reject(new Error('YouTube IFrame API loaded without a Player constructor'))
    }

    const script = document.createElement('script')
    script.src = API_SRC
    script.async = true
    script.onerror = () => {
      apiPromise = null
      reject(new Error('Could not load the YouTube IFrame API'))
    }
    document.head.appendChild(script)
  })

  return apiPromise
}

export function useYouTubePlayer() {
  /** True once the player has booted and can report/seek the playhead. */
  const ready = ref(false)
  /** True when the API could not be loaded — the caller should fall back. */
  const unavailable = ref(false)

  let player: YouTubePlayer | null = null
  let wantedVideoId = ''
  let wantedStart = 0
  let creating = false

  /**
   * Show `videoId` in `host`, creating the player on first call and swapping
   * the video on later ones. `host` is replaced by the player's iframe.
   * `startSeconds` opens the video at a given position — that is what makes a
   * note in another lesson jump straight to its own timestamp.
   */
  async function play(host: HTMLElement | null, videoId: string, startSeconds = 0) {
    wantedVideoId = videoId
    wantedStart = startSeconds

    if (player) {
      player.loadVideoById({ videoId, startSeconds })
      return
    }
    // While the API boots there is no player yet; a lesson switch in that window
    // only updates what the player should open with once it exists.
    if (creating || !host || unavailable.value) return

    creating = true
    try {
      const api = await loadApi()
      player = new api.Player(host, {
        videoId: wantedVideoId,
        playerVars: { rel: 0, modestbranding: 1, start: wantedStart },
        events: { onReady: () => (ready.value = true) },
      })
    } catch (error) {
      console.error(error)
      unavailable.value = true
    } finally {
      creating = false
    }
  }

  /** Current playhead in whole seconds, or null when the player isn't ready. */
  function currentTime(): number | null {
    if (!player || !ready.value) return null
    try {
      return Math.floor(player.getCurrentTime())
    } catch {
      return null
    }
  }

  /** Jump to `seconds` and resume playback. Returns false if not possible. */
  function seekTo(seconds: number): boolean {
    if (!player || !ready.value) return false
    try {
      player.seekTo(Math.max(0, seconds), true)
      player.playVideo()
      return true
    } catch {
      return false
    }
  }

  function destroy() {
    try {
      player?.destroy()
    } catch {
      /* the player may already be gone with its host element */
    }
    player = null
    ready.value = false
  }

  onBeforeUnmount(destroy)

  return { ready, unavailable, play, currentTime, seekTo, destroy }
}
