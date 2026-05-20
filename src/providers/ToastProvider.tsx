import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration: number;
}

interface ToastContextValue {
  toasts: Toast[];
  show: (toast: Omit<Toast, 'id' | 'duration'> & { duration?: number }) => string;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}

const TYPE_META: Record<
  ToastType,
  { icon: typeof CheckCircle2; bar: string; iconClass: string; ring: string }
> = {
  success: {
    icon: CheckCircle2,
    bar: 'bg-success-500',
    iconClass: 'text-success-500',
    ring: 'ring-success-500/20',
  },
  error: {
    icon: AlertCircle,
    bar: 'bg-error-500',
    iconClass: 'text-error-500',
    ring: 'ring-error-500/20',
  },
  warning: {
    icon: AlertTriangle,
    bar: 'bg-warning-500',
    iconClass: 'text-warning-500',
    ring: 'ring-warning-500/20',
  },
  info: {
    icon: Info,
    bar: 'bg-info-500',
    iconClass: 'text-info-500',
    ring: 'ring-info-500/20',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, number>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const handle = timers.current[id];
    if (handle) {
      window.clearTimeout(handle);
      delete timers.current[id];
    }
  }, []);

  const show = useCallback<ToastContextValue['show']>(
    ({ duration = 4000, ...rest }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const toast: Toast = { id, duration, ...rest };
      setToasts((prev) => [...prev, toast]);
      timers.current[id] = window.setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  const helpers = useMemo(
    () => ({
      success: (title: string, description?: string) => show({ type: 'success', title, description }),
      error: (title: string, description?: string) => show({ type: 'error', title, description }),
      warning: (title: string, description?: string) => show({ type: 'warning', title, description }),
      info: (title: string, description?: string) => show({ type: 'info', title, description }),
    }),
    [show],
  );

  useEffect(() => {
    const cur = timers.current;
    return () => {
      Object.values(cur).forEach((handle) => window.clearTimeout(handle));
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, show, dismiss, ...helpers }),
    [toasts, show, dismiss, helpers],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 px-4 pt-4 sm:items-end sm:right-4 sm:left-auto sm:max-w-sm"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>,
    document.body,
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const meta = TYPE_META[toast.type];
  const Icon = meta.icon;
  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto w-full overflow-hidden rounded-lg border border-surface-300/70 bg-surface-50 shadow-md ring-1 dark:border-surface-800 dark:bg-surface-900',
        meta.ring,
        'animate-slide-down',
      )}
    >
      <div className="flex items-start gap-3 p-3.5">
        <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', meta.iconClass)} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-body-sm font-semibold text-surface-800 dark:text-surface-100">{toast.title}</p>
          {toast.description ? (
            <p className="mt-0.5 text-body-sm text-surface-600 dark:text-surface-400">{toast.description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar notificación"
          className="shrink-0 rounded-md p-1 text-surface-500 transition-colors hover:bg-surface-200 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="relative h-1 w-full bg-surface-200 dark:bg-surface-800">
        <div
          className={cn('absolute inset-y-0 left-0', meta.bar)}
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
            width: '100%',
          }}
        />
      </div>
      <style>{`@keyframes toast-progress { from { transform: scaleX(1); transform-origin: left; } to { transform: scaleX(0); transform-origin: left; } }`}</style>
    </div>
  );
}
