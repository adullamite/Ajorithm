import { useState, useCallback, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dismissing?: boolean;
}

let globalAddToast: ((toast: Omit<ToastItem, 'id'>) => void) | null = null;

export function triggerToast(toast: Omit<ToastItem, 'id'>) {
  if (globalAddToast) {
    globalAddToast(toast);
  }
}

export function useAppToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    counterRef.current += 1;
    const id = `toast-${Date.now()}-${counterRef.current}`;
    const newToast: ToastItem = { ...toast, id, duration: toast.duration ?? 4000 };
    setToasts((prev) => [...prev.slice(-4), newToast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dismissing: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Register global toast function
  globalAddToast = addToast;

  return { toasts, addToast, dismissToast, removeToast };
}
