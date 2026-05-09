import React, { useEffect, useState, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppToast, type ToastItem, type ToastType } from '@/hooks/useAppToast';

// Context
interface ToastContextValue {
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = createContext<ToastContextValue>({ addToast: () => {} });

export function useToastContext() {
  return useContext(ToastContext);
}

// Icons
const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

// Color classes
const toastColorClasses: Record<ToastType, string> = {
  success: 'text-toast-success',
  error: 'text-toast-error',
  warning: 'text-toast-warning',
  info: 'text-toast-info',
};

const toastProgressClasses: Record<ToastType, string> = {
  success: 'bg-toast-success',
  error: 'bg-toast-error',
  warning: 'bg-toast-warning',
  info: 'bg-toast-info',
};

// Single toast item component
function ToastItemComponent({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration ?? 4000;

  useEffect(() => {
    const interval = 50;
    const decrement = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss(toast.id);
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [toast.id, duration, onDismiss]);

  return (
    <div
      className={cn(
        'glass-strong relative overflow-hidden w-[360px] max-w-[calc(100vw-2rem)]',
        'shadow-lg shadow-background/50',
        toast.dismissing ? 'slide-out-right' : 'slide-in-right'
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <span className={cn('flex-shrink-0 mt-0.5', toastColorClasses[toast.type])}>
          {toastIcons[toast.type]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{toast.title}</p>
          {toast.message && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate font-mono">
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-0.5 w-full bg-border/50">
        <div
          className={cn('h-full transition-none', toastProgressClasses[toast.type])}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Toast container
function ToastContainer() {
  const { toasts, dismissToast } = useAppToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 md:items-end items-center md:right-6 md:left-auto left-1/2 md:translate-x-0 -translate-x-1/2">
      {toasts.map((toast) => (
        <ToastItemComponent key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}

// Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { addToast } = useAppToast();

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}
