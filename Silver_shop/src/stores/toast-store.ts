import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info';

interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
  visible: boolean;
  show: (message: string, tone?: ToastTone) => void;
  hide: () => void;
}

let hideTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set, get) => ({
  id: 0,
  message: '',
  tone: 'info',
  visible: false,

  show: (message, tone = 'info') => {
    if (hideTimer) clearTimeout(hideTimer);
    set((s) => ({ id: s.id + 1, message, tone, visible: true }));
    hideTimer = setTimeout(() => get().hide(), 3200);
  },

  hide: () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    set({ visible: false });
  },
}));

/** Helper so screens don't touch the store shape directly. */
export function showToast(message: string, tone: ToastTone = 'info'): void {
  useToastStore.getState().show(message, tone);
}
