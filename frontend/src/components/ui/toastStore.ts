import { create } from 'zustand'

export type ToastType = 'info' | 'warning' | 'error' | 'success'

export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  duration?: number
}

interface ToastStore {
  toasts: ToastMessage[]
  addToast: (toast: Omit<ToastMessage, 'id'>) => string
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastMessage = { ...toast, id }
    set((state) => ({ toasts: [...state.toasts, newToast] }))

    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, duration)
    }

    return id
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))

export const toast = {
  info: (title: string, description?: string, options?: Partial<ToastMessage>) =>
    useToastStore.getState().addToast({ type: 'info', title, description, ...options }),
  warning: (title: string, description?: string, options?: Partial<ToastMessage>) =>
    useToastStore.getState().addToast({ type: 'warning', title, description, ...options }),
  error: (title: string, description?: string, options?: Partial<ToastMessage>) =>
    useToastStore.getState().addToast({ type: 'error', title, description, ...options }),
  success: (title: string, description?: string, options?: Partial<ToastMessage>) =>
    useToastStore.getState().addToast({ type: 'success', title, description, ...options }),
}
