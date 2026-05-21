import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BRAND_PRIMARY = new THREE.Color('#0AFFE0');
const BRAND_SECONDARY = new THREE.Color('#7000FF');

export interface ParticlesFieldProps {
  /** Cantidad de partículas. Se trunca al final por `particleScale`. */
  count?: number;
  /** Multiplicador adaptativo (0..1) controlado por `useAdaptiveQuality`. */
  particleScale?: number;
  /** Radio de la esfera contenedora. */
  radius?: number;
  /** Tamaño base de cada punto. */
  size?: number;
  /** Opacidad (0..1). */
  opacity?: number;
  /** Velocidad de la deriva en Y. */
  speed?: number;
  /** Mezcla aditiva (recomendado para look "glow"). */
  additive?: boolean;
  /**
   * Color principal. Si `dual` es true, las partículas se mezclan con
   * `BRAND_SECONDARY` según su posición.
   */
  color?: string;
  dual?: boolean;
}

/**
 * ParticlesField — campo de partículas flotantes reutilizable.
 *
 * Implementado con `THREE.Points` + `BufferGeometry` para ser barato.
 * Anima la posición Y con `useFrame` y respeta `particleScale` para
 * adaptarse al rendimiento del dispositivo.
 *
 * Llama a este componente DENTRO de un `<Canvas>`.
 */
export function ParticlesField({
  count = 2000,
  particleScale = 1,
  radius = 12,
  size = 0.03,
  opacity = 0.85,
  speed = 0.06,
  additive = true,
  color = '#0AFFE0',
  dual = false,
}: ParticlesFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const effectiveCount = Math.max(64, Math.floor(count * particleScale));

  const { positions, colors, speeds } = useMemo(() => {
    const positions = new Float32Array(effectiveCount * 3);
    const colors = new Float32Array(effectiveCount * 3);
    const speeds = new Float32Array(effectiveCount);
    const base = new THREE.Color(color);

    for (let i = 0; i < effectiveCount; i++) {
      // Distribución dentro de un cubo con bias esférico para evitar bordes duros.
      const r = radius * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      if (dual) {
        const mix = (y + radius) / (radius * 2);
        const c = BRAND_PRIMARY.clone().lerp(BRAND_SECONDARY, mix);
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      } else {
        colors[i * 3] = base.r;
        colors[i * 3 + 1] = base.g;
        colors[i * 3 + 2] = base.b;
      }

      speeds[i] = 0.5 + Math.random() * 1.5;
    }

    return { positions, colors, speeds };
  }, [effectiveCount, radius, color, dual]);

  useFrame((_state, delta) => {
    const points = pointsRef.current;
    if (!points) return;
    const attr = points.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;

    for (let i = 0; i < effectiveCount; i++) {
      const idx = i * 3 + 1;
      const s = speeds[i] ?? 1;
      const cur = (arr[idx] ?? 0) + delta * speed * s;
      arr[idx] = cur > radius ? -radius : cur;
    }
    attr.needsUpdate = true;
    // Rotación suave de todo el campo en Y.
    points.rotation.y += delta * 0.02;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-pSpeed" args={[speeds, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        sizeAttenuation
        vertexColors
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

export default ParticlesField;
