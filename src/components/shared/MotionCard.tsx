import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Card, type CardVariant } from '@/components/ui/Card';

export interface MotionCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Activa hover lift (translateY -4px + shadow). Default true. */
  lift?: boolean;
  /** Activa la entrada animada (fade + y) cuando se monta. Default false. */
  animateIn?: boolean;
  children: ReactNode;
  as?: 'div' | 'article' | 'section';
}

const BRAND_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * MotionCard — wrapper liviano alrededor de `<Card>` con micro-animaciones
 * de Framer Motion (entrada opcional + hover lift translateY -4px).
 *
 * - No introduce variantes nuevas: reutiliza la API del `Card` existente.
 * - Si `prefers-reduced-motion` está activo, no aplica animaciones.
 */
export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(function MotionCard(
  { variant = 'elevated', padding = 'md', lift = true, animateIn = false, className, children, ...rest },
  ref,
) {
  const reduced = useReducedMotion();

  if (reduced || (!lift && !animateIn)) {
    return (
      <Card ref={ref} variant={variant} padding={padding} className={className} {...rest}>
        {children}
      </Card>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={animateIn ? { opacity: 0, y: 12 } : false}
      animate={animateIn ? { opacity: 1, y: 0, transition: { duration: 0.5, ease: BRAND_EASE } } : undefined}
      whileHover={lift ? { y: -4, transition: { duration: 0.3, ease: BRAND_EASE } } : undefined}
      className={cn('will-change-transform', className)}
      {...(rest as Record<string, unknown>)}
    >
      <Card variant={variant} padding={padding} className="h-full transition-shadow duration-300 ease-smooth hover:shadow-lg">
        {children}
      </Card>
    </motion.div>
  );
});

export default MotionCard;
