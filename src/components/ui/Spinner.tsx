import { cn } from '@/utils/cn';

/**
 * Spinner
 * Variants: size — xs | sm | md | lg
 * Inherits color from currentColor by default.
 */
interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const SIZE_MAP: Record<NonNullable<SpinnerProps['size']>, string> = {
  xs: 'h-3 w-3 border-[1.5px]',
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-7 w-7 border-[3px]',
};

export function Spinner({ size = 'md', className, label = 'Cargando' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin-slow rounded-full border-current border-t-transparent',
        SIZE_MAP[size],
        className,
      )}
    />
  );
}
