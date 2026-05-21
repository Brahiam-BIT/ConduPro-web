import { Suspense, useMemo, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import type { ComponentProps } from 'react';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

type CanvasComponentProps = ComponentProps<typeof Canvas>;

export interface BrandCanvasProps extends Omit<CanvasComponentProps, 'children' | 'dpr' | 'frameloop'> {
  children: ReactNode;
  /** Si true, fuerza `frameloop="never"` (útil para reducir consumo en screenshots). */
  paused?: boolean;
  /** Color de fondo del canvas (clearColor implícito vía CSS). */
  background?: string;
}

/**
 * BrandCanvas — wrapper de `@react-three/fiber` con los defaults del proyecto:
 *
 *  - `dpr` capeado a `[1, min(2, devicePixelRatio)]`.
 *  - Pausa el render-loop cuando la pestaña está en background
 *    (`frameloop="never"`) o cuando el usuario tiene `prefers-reduced-motion`.
 *  - `gl.antialias = false` + powerPreference high-performance.
 *  - Suspense interno con fallback transparente para el árbol 3D.
 */
export function BrandCanvas({
  children,
  paused = false,
  background = '#04020F',
  camera,
  gl,
  style,
  ...rest
}: BrandCanvasProps) {
  const visible = usePageVisibility();
  const reduced = usePrefersReducedMotion();
  const shouldPause = paused || !visible;

  const dpr = useMemo<[number, number]>(() => {
    if (typeof window === 'undefined') return [1, 1.5];
    return [1, Math.min(2, window.devicePixelRatio || 1)];
  }, []);

  const mergedCamera = { fov: 50, near: 0.1, far: 100, position: [0, 1.4, 6], ...(camera ?? {}) };

  return (
    <Canvas
      dpr={dpr}
      frameloop={shouldPause ? 'never' : reduced ? 'demand' : 'always'}
      camera={mergedCamera as CanvasComponentProps['camera']}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', ...gl }}
      style={{ background, ...style }}
      {...rest}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}

export default BrandCanvas;
