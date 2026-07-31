/**
 * "Jump back in" — the courses this browser looked at most recently.
 *
 * Deliberately local: it is a browsing convenience, not account data, so it
 * needs no round trip and works before sign-in.
 */
import { ref } from 'vue'

const STORAGE_KEY = 'op:recent-courses'
const MAX_ENTRIES = 8

export interface RecentCourse {
  id: number
  title: string
  thumb_url?: string
  category?: string
  viewedAt: number
}

const recent = ref<RecentCourse[]>(read())

function read(): RecentCourse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((entry) => entry && Number(entry.id)) : []
  } catch {
    return []
  }
}

export function useRecentCourses() {
  /** Record a visit, moving the course to the front of the list. */
  function remember(course: { id: number | string; title: string; thumb_url?: string; category?: string }) {
    const id = Number(course?.id)
    if (!id || !course?.title) return

    const entry: RecentCourse = {
      id,
      title: course.title,
      thumb_url: course.thumb_url,
      category: course.category,
      viewedAt: Date.now(),
    }
    const next = [entry, ...recent.value.filter((item) => item.id !== id)].slice(0, MAX_ENTRIES)

    recent.value = next
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* private mode / quota — the in-memory list still works for this session */
    }
  }

  function clear() {
    recent.value = []
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* nothing to do */
    }
  }

  return { recent, remember, clear }
}
