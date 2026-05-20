import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Modal
 * - Portal-based render
 * - Overlay with blur, scale+fade animation
 * - Closes with Esc or click outside
 * - On mobile (<640px) renders as a bottom-sheet with slide-up animation
 * - Implements focus trap with first/last tabbable elements
 */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  footer?: ReactNode;
  hideCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  bottomSheetOnMobile?: boolean;
}

const SIZE_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  hideCloseButton = false,
  closeOnOverlayClick = true,
  bottomSheetOnMobile = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocused.current = document.activeElement as HTMLElement | null;
    const focusable = dialogRef.current?.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
    return () => {
      lastFocused.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
      onClick={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) onClose();
      }}
      onKeyDown={onKeyDown}
    >
      <div
        className="absolute inset-0 bg-surface-950/40 backdrop-blur-sm animate-fade-in"
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        tabIndex={-1}
        className={cn(
          'relative w-full rounded-t-xl bg-surface-50 shadow-xl outline-none dark:bg-surface-900',
          'sm:rounded-xl',
          bottomSheetOnMobile ? 'animate-sheet-up sm:animate-scale-in' : 'animate-scale-in',
          SIZE_MAP[size],
        )}
      >
        {(title || !hideCloseButton) && (
          <div className="flex items-start justify-between gap-3 px-5 pt-5">
            <div className="min-w-0">
              {title ? (
                <h2 id="modal-title" className="text-heading-md text-surface-800 dark:text-surface-100">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p id="modal-description" className="mt-1 text-body-sm text-surface-600 dark:text-surface-400">
                  {description}
                </p>
              ) : null}
            </div>
            {!hideCloseButton ? (
              <button
                type="button"
                aria-label="Cerrar modal"
                onClick={onClose}
                className="-mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-surface-500 transition-colors hover:bg-surface-200 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-200"
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-surface-200 px-5 py-4 dark:border-surface-800">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
