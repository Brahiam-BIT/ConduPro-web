import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

export type QualityTier = 'high' | 'medium' | 'low';

interface QualityResult {
  /** Tier actual, derivado del FPS medido. */
  tier: QualityTier;
  /** Habilita post-processing pesado (bloom, chromatic aberration, etc). */
  postprocessing: boolean;
  /** Multiplicador para densidad de partículas (1.0 = nominal). */
  particleScale: number;
  /** FPS instantáneo (suavizado). */
  fps: number;
}

interface UseAdaptiveQualityOptions {
  /** Tier inicial mientras no haya muestras suficientes. */
  initialTier?: QualityTier;
  /** FPS por debajo del cual se baja de "high" a "medium". */
  mediumThreshold?: number;
  /** FPS por debajo del cual se baja de "medium" a "low". */
  lowThreshold?: number;
  /** Cuántas muestras estables hacen falta antes de degradar (anti-rebote). */
  sampleWindow?: number;
}

/**
 * Hook que mide FPS dentro de un `<Canvas>` de R3F y degrada calidad
 * automáticamente. Se diseñó para usarse a nivel de escena (debe llamarse
 * dentro del Canvas porque depende de `useFrame`).
 *
 * Estrategia: media exponencial del delta para suavizar el FPS y un contador
 * de muestras consecutivas bajo el umbral para evitar oscilaciones.
 *
 * Por defecto baja a `medium` bajo 45 fps y a `low` bajo 30 fps, sólo
 * desciende (nunca vuelve a subir) para no entrar en bucles de cambio.
 */
export function useAdaptiveQuality(options: UseAdaptiveQualityOptions = {}): QualityResult {
  const {
    initialTier = 'high',
    mediumThreshold = 45,
    lowThreshold = 30,
    sampleWindow = 60,
  } = options;

  const smoothedFps = useRef<number>(60);
  const consecutiveLow = useRef<number>(0);
  const consecutiveMedium = useRef<number>(0);

  const [tier, setTier] = useState<QualityTier>(initialTier);
  const [fps, setFps] = useState<number>(60);

  useFrame((_state, delta) => {
    if (delta <= 0) return;
    const instantFps = 1 / delta;
    smoothedFps.current = smoothedFps.current * 0.92 + instantFps * 0.08;

    if (smoothedFps.current < lowThreshold) {
      consecutiveLow.current += 1;
      consecutiveMedium.current = 0;
    } else if (smoothedFps.current < mediumThreshold) {
      consecutiveMedium.current += 1;
      consecutiveLow.current = 0;
    } else {
      consecutiveLow.current = 0;
      consecutiveMedium.current = 0;
    }

    if (consecutiveLow.current > sampleWindow && tier !== 'low') {
      setTier('low');
    } else if (consecutiveMedium.current > sampleWindow && tier === 'high') {
      setTier('medium');
    }

    // Limita las actualizaciones de estado del FPS visible.
    if (Math.abs(smoothedFps.current - fps) > 4) {
      setFps(Math.round(smoothedFps.current));
    }
  });

  return {
    tier,
    postprocessing: tier === 'high',
    particleScale: tier === 'high' ? 1 : tier === 'medium' ? 0.6 : 0.3,
    fps,
  };
}
