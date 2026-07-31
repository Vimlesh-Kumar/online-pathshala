import { reactive } from 'vue'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

const state = reactive<{ toasts: ToastItem[] }>({ toasts: [] })
let counter = 0

function remove(id: number) {
  const idx = state.toasts.findIndex((t) => t.id === id)
  if (idx !== -1) state.toasts.splice(idx, 1)
}

function push(message: string, type: ToastType = 'info', duration = 3500) {
  const id = ++counter
  state.toasts.push({ id, message, type })
  setTimeout(() => remove(id), duration)
  return id
}

export const toast = {
  success: (message: string) => push(message, 'success'),
  error: (message: string) => push(message, 'error'),
  info: (message: string) => push(message, 'info'),
  remove
}

export function useToastState() {
  return state
}
