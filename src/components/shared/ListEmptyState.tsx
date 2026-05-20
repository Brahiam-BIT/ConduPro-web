import type { ReactNode } from 'react';

export type EmptyIllustration = 'default' | 'calendar' | 'users' | 'car' | 'chart';

interface ListEmptyStateProps {
  title: string;
  description?: string;
  illustration?: EmptyIllustration;
  action?: ReactNode;
}

function EmptyIllustrationSvg({ variant }: { variant: EmptyIllustration }) {
  if (variant === 'calendar') {
    return (
      <svg width="96" height="96" viewBox="0 0 120 120" aria-hidden>
        <defs>
          <linearGradient id="empty-cal-g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <rect x="20" y="24" width="80" height="72" rx="12" fill="url(#empty-cal-g)" opacity="0.15" />
        <rect x="28" y="36" width="64" height="48" rx="8" stroke="url(#empty-cal-g)" strokeWidth="2" fill="none" />
        <circle cx="44" cy="56" r="6" fill="url(#empty-cal-g)" />
        <line x1="56" y1="56" x2="84" y2="56" stroke="url(#empty-cal-g)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="44" cy="72" r="6" fill="url(#empty-cal-g)" opacity="0.4" />
        <line x1="56" y1="72" x2="76" y2="72" stroke="url(#empty-cal-g)" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      </svg>
    );
  }

  if (variant === 'users') {
    return (
      <svg width="96" height="96" viewBox="0 0 120 120" aria-hidden>
        <defs>
          <linearGradient id="empty-users-g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="44" r="18" fill="url(#empty-users-g)" opacity="0.2" />
        <circle cx="60" cy="40" r="10" stroke="url(#empty-users-g)" strokeWidth="2.5" fill="none" />
        <path d="M36 88c0-14 10.7-24 24-24s24 10 24 24" stroke="url(#empty-users-g)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="34" cy="52" r="8" stroke="url(#empty-users-g)" strokeWidth="2" fill="none" opacity="0.5" />
        <circle cx="86" cy="52" r="8" stroke="url(#empty-users-g)" strokeWidth="2" fill="none" opacity="0.5" />
      </svg>
    );
  }

  if (variant === 'car') {
    return (
      <svg width="96" height="96" viewBox="0 0 120 120" aria-hidden>
        <defs>
          <linearGradient id="empty-car-g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <rect x="18" y="52" width="84" height="32" rx="10" fill="url(#empty-car-g)" opacity="0.15" />
        <path
          d="M28 68 L40 48 H80 L92 68 Z"
          stroke="url(#empty-car-g)"
          strokeWidth="2.5"
          fill="none"
          strokeLinejoin="round"
        />
        <circle cx="38" cy="78" r="8" stroke="url(#empty-car-g)" strokeWidth="2.5" fill="none" />
        <circle cx="82" cy="78" r="8" stroke="url(#empty-car-g)" strokeWidth="2.5" fill="none" />
      </svg>
    );
  }

  if (variant === 'chart') {
    return (
      <svg width="96" height="96" viewBox="0 0 120 120" aria-hidden>
        <defs>
          <linearGradient id="empty-chart-g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <rect x="24" y="70" width="14" height="28" rx="4" fill="url(#empty-chart-g)" opacity="0.35" />
        <rect x="48" y="50" width="14" height="48" rx="4" fill="url(#empty-chart-g)" />
        <rect x="72" y="36" width="14" height="62" rx="4" fill="url(#empty-chart-g)" opacity="0.7" />
        <line x1="20" y1="98" x2="100" y2="98" stroke="url(#empty-chart-g)" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg width="96" height="96" viewBox="0 0 120 120" aria-hidden>
      <defs>
        <linearGradient id="empty-default-g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <rect x="14" y="22" width="92" height="76" rx="14" fill="url(#empty-default-g)" opacity="0.18" />
      <rect x="22" y="32" width="76" height="58" rx="10" stroke="url(#empty-default-g)" strokeWidth="2.5" fill="none" />
      <line x1="22" y1="46" x2="98" y2="46" stroke="url(#empty-default-g)" strokeWidth="2.5" />
      <circle cx="38" cy="63" r="5" fill="url(#empty-default-g)" />
      <line x1="50" y1="63" x2="86" y2="63" stroke="url(#empty-default-g)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="38" cy="78" r="5" fill="url(#empty-default-g)" opacity="0.5" />
      <line x1="50" y1="78" x2="78" y2="78" stroke="url(#empty-default-g)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

export function ListEmptyState({
  title,
  description,
  illustration = 'default',
  action,
}: ListEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
      <EmptyIllustrationSvg variant={illustration} />
      <div>
        <p className="text-heading-sm text-surface-800 dark:text-surface-100">{title}</p>
        {description ? (
          <p className="mt-1 max-w-sm text-body-sm text-surface-500 dark:text-surface-400">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
