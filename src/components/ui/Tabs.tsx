import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * Tabs
 * - Animated underline indicator that slides between tabs
 * - Controlled or uncontrolled via defaultValue
 */
export interface TabItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  variant?: 'underline' | 'pill';
}

export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  className,
  variant = 'underline',
}: TabsProps) {
  const fallbackInitial = defaultValue ?? items[0]?.value ?? '';
  const [internalValue, setInternalValue] = useState<string>(fallbackInitial);
  const currentValue = value ?? internalValue;
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  const updateIndicator = () => {
    const root = containerRef.current;
    if (!root) return;
    const active = root.querySelector<HTMLElement>(`[data-tab-value="${CSS.escape(currentValue)}"]`);
    if (!active) {
      setIndicator(null);
      return;
    }
    const rootRect = root.getBoundingClientRect();
    const rect = active.getBoundingClientRect();
    setIndicator({ left: rect.left - rootRect.left, width: rect.width });
  };

  useLayoutEffect(() => {
    updateIndicator();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue, items]);

  useEffect(() => {
    const onResize = () => updateIndicator();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (v: string) => {
    if (value === undefined) setInternalValue(v);
    onValueChange?.(v);
  };

  return (
    <div
      ref={containerRef}
      role="tablist"
      className={cn(
        'relative inline-flex items-center gap-1',
        variant === 'underline' && 'border-b border-surface-200 dark:border-surface-800',
        variant === 'pill' && 'rounded-lg bg-surface-200/70 p-1 dark:bg-surface-800/60',
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.value === currentValue;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            data-tab-value={item.value}
            aria-selected={isActive}
            disabled={item.disabled}
            onClick={() => handleSelect(item.value)}
            className={cn(
              'relative z-10 inline-flex h-9 select-none items-center justify-center px-3 text-body-sm font-medium transition-colors duration-150 ease-smooth disabled:cursor-not-allowed disabled:opacity-50',
              variant === 'underline' &&
                (isActive
                  ? 'text-primary-700 dark:text-primary-300'
                  : 'text-surface-600 hover:text-surface-800 dark:text-surface-400 dark:hover:text-surface-200'),
              variant === 'pill' &&
                (isActive
                  ? 'text-surface-900 dark:text-surface-50'
                  : 'text-surface-600 hover:text-surface-800 dark:text-surface-400 dark:hover:text-surface-200'),
            )}
          >
            {item.label}
          </button>
        );
      })}

      {indicator && variant === 'underline' ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-px h-0.5 rounded-full bg-primary-600 transition-all duration-200 ease-smooth"
          style={{ left: indicator.left, width: indicator.width }}
        />
      ) : null}
      {indicator && variant === 'pill' ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-1 rounded-md bg-surface-50 shadow-sm transition-all duration-200 ease-smooth dark:bg-surface-700"
          style={{ left: indicator.left, width: indicator.width }}
        />
      ) : null}
    </div>
  );
}
