import { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const BRAND_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ────────────────────────────────────────────────────────
 * Variants compartidas entre páginas del dashboard.
 * El contenedor stagger sus hijos; cada hijo aparece con
 * fade + ligero translateY.
 * ──────────────────────────────────────────────────────── */

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.05,
      staggerChildren: 0.08,
    },
  },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: BRAND_EASE },
  },
};

export interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  /** Aplica un delay base extra (ej. para diferir bloques completos). */
  delay?: number;
  /** Stagger entre hijos (default 0.08s). */
  stagger?: number;
}

/**
 * StaggerContainer — orquesta la entrada en cascada de sus hijos `<StaggerItem>`.
 *
 * Uso típico:
 *   <StaggerContainer>
 *     <StaggerItem>Header</StaggerItem>
 *     <StaggerItem>Cards</StaggerItem>
 *     <StaggerItem delay={0.2}>Tabla</StaggerItem>
 *   </StaggerContainer>
 *
 * Respeta `prefers-reduced-motion`: si está activo, deja `display` sin animar.
 */
export function StaggerContainer({ children, className, delay = 0, stagger }: StaggerContainerProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: 0.05 + delay,
            staggerChildren: stagger ?? CONTAINER_VARIANTS.visible.transition.staggerChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  /** Delay extra acumulado (en segundos). */
  delay?: number;
  /** Distancia inicial en Y (px). Default 14. */
  y?: number;
  /** Cambia el elemento HTML del wrapper (por accesibilidad / semántica). */
  as?: 'div' | 'section' | 'article' | 'header' | 'aside';
}

/**
 * StaggerItem — hijo animado individualmente dentro de un `<StaggerContainer>`.
 */
export function StaggerItem({ children, className, delay = 0, y = 14, as = 'div' }: StaggerItemProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: BRAND_EASE, delay },
        },
      }}
    >
      {children}
    </Comp>
  );
}

/* Re-exporta los variants para que otras animaciones puedan compartir
 * los timings (ej. variantes locales que necesiten mismo ease/delay). */
export const PAGE_VARIANTS = { container: CONTAINER_VARIANTS, item: ITEM_VARIANTS };

export default StaggerContainer;
