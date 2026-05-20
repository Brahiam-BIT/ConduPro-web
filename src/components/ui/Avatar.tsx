import { useState, type ImgHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { colorFromString, getInitials } from '@/utils/formatters';

/**
 * Avatar
 * Sizes: xs | sm | md | lg | xl
 * Fallback: initials with a color deterministically derived from the name.
 */
type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  ringed?: boolean;
}

const SIZE_MAP: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-body-sm',
  lg: 'h-12 w-12 text-body-md',
  xl: 'h-16 w-16 text-heading-sm',
};

export function Avatar({ src, name, size = 'md', ringed = false, className, ...rest }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = getInitials(name);
  const showImage = src && !failed;
  const bg = colorFromString(name);

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-semibold text-white',
        ringed && 'ring-2 ring-surface-50 dark:ring-surface-900',
        SIZE_MAP[size],
        className,
      )}
      style={showImage ? undefined : { backgroundColor: bg }}
      aria-label={name}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
          {...rest}
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </span>
  );
}
