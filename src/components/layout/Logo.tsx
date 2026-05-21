import { cn } from '@/utils/cn';

export function Logo({
  size = 32,
  withText = true,
  className,
}: {
  size?: number;
  withText?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role="img"
        aria-label="ConduPro"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="cp-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#cp-grad)" />
        <path d="M20 40 L32 18 L44 40 Z" fill="white" opacity="0.95" />
        <circle cx="32" cy="44" r="3" fill="white" />
      </svg>
      {withText ? (
        <span className="text-heading-sm font-extrabold tracking-tight text-text-primary">
          Condu<span className="text-accent">Pro</span>
        </span>
      ) : null}
    </span>
  );
}
