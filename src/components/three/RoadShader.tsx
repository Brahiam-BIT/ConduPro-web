import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface RoadShaderProps {
  /** Tamaño del plano [width, length]. */
  size?: [number, number];
  /** Velocidad del scroll de las líneas (positivo = hacia la cámara). */
  speed?: number;
  /** Color del asfalto. */
  asphaltColor?: string;
  /** Color de las líneas centrales. */
  laneColor?: string;
  /** Color del brillo en el horizonte. */
  glowColor?: string;
  /** Cantidad de carriles (incluye centrales + bordes). */
  lanes?: number;
  /** Opacidad global del shader (0..1). */
  opacity?: number;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uLanes;
  uniform float uOpacity;
  uniform vec3 uAsphalt;
  uniform vec3 uLane;
  uniform vec3 uGlow;

  // Dashed line along the length of the road (vUv.y).
  float dashed(float v, float period, float duty) {
    float p = fract(v / period);
    return step(p, duty);
  }

  void main() {
    // vUv.x ∈ [0..1] across width, vUv.y ∈ [0..1] along length.
    float yScroll = vUv.y - uTime * uSpeed;

    // Asphalt base
    vec3 col = uAsphalt;

    // Subtle noise texture (cheap)
    float n = fract(sin(dot(vUv * 200.0, vec2(12.9898, 78.233))) * 43758.5453);
    col += (n - 0.5) * 0.04;

    // Center lane lines (dashed)
    float centerBand = smoothstep(0.015, 0.0, abs(vUv.x - 0.5));
    float centerDash = dashed(yScroll, 0.08, 0.5);
    float center = centerBand * centerDash;

    // Side lanes (continuous bright)
    float sideL = smoothstep(0.01, 0.0, abs(vUv.x - 0.06));
    float sideR = smoothstep(0.01, 0.0, abs(vUv.x - 0.94));

    // Intermediate lanes (dashed) repeated by uLanes
    float gridX = abs(fract(vUv.x * uLanes) - 0.5);
    float intermediate = smoothstep(0.02, 0.0, gridX) * dashed(yScroll, 0.05, 0.5) * 0.6;

    float lanesMask = clamp(center + sideL + sideR + intermediate, 0.0, 1.0);

    // Horizon glow that fades away from the camera (vUv.y → 1 = far away).
    float horizon = smoothstep(0.55, 1.0, vUv.y);
    vec3 horizonGlow = uGlow * horizon * 0.55;

    // Compose
    col = mix(col, uLane, lanesMask);
    col += horizonGlow;
    col += uGlow * lanesMask * 0.35; // bloom-friendly emissive boost

    // Fade out at the very end so the road dissolves with fog
    float endFade = smoothstep(1.0, 0.7, vUv.y);
    float alpha = uOpacity * mix(1.0, 1.0, endFade);

    gl_FragColor = vec4(col, alpha);
  }
`;

/**
 * RoadShader — plano horizontal con material `ShaderMaterial` que dibuja
 * una carretera futurista con líneas de carril desplazándose hacia la
 * cámara en loop infinito.
 *
 * Pensado para usarse:
 *   <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
 *     <planeGeometry args={[size[0], size[1], 1, 1]} />
 *     <RoadShader />
 *   </mesh>
 *
 * Pero se exporta también un wrapper conveniente `RoadMesh` que arma el
 * plano y aplica el material en una sola línea.
 */
export function RoadShader({
  speed = 0.6,
  asphaltColor = '#04020F',
  laneColor = '#0AFFE0',
  glowColor = '#7000FF',
  lanes = 6,
  opacity = 1,
}: Omit<RoadShaderProps, 'size'>) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uLanes: { value: lanes },
      uOpacity: { value: opacity },
      uAsphalt: { value: new THREE.Color(asphaltColor) },
      uLane: { value: new THREE.Color(laneColor) },
      uGlow: { value: new THREE.Color(glowColor) },
    }),
    // Solo se inicializa una vez; los cambios se aplican en el efecto siguiente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((_state, delta) => {
    const mat = matRef.current;
    if (!mat) return;
    const u = mat.uniforms as Record<string, { value: unknown }>;
    u.uTime!.value = (u.uTime!.value as number) + delta;
    u.uSpeed!.value = speed;
    u.uLanes!.value = lanes;
    u.uOpacity!.value = opacity;
    (u.uAsphalt!.value as THREE.Color).set(asphaltColor);
    (u.uLane!.value as THREE.Color).set(laneColor);
    (u.uGlow!.value as THREE.Color).set(glowColor);
  });

  return (
    <shaderMaterial
      ref={matRef}
      uniforms={uniforms}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      transparent
      depthWrite={false}
      side={THREE.DoubleSide}
    />
  );
}

/**
 * Wrapper conveniente: plano horizontal con el shader aplicado.
 * El plano se acuesta sobre XZ (apunta al cielo) y la dimensión Y del
 * uv corre a lo largo de Z (hacia la cámara).
 */
export function RoadMesh({
  size = [22, 80],
  position = [0, 0, -10],
  ...shader
}: RoadShaderProps & { position?: [number, number, number] }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={position}>
      <planeGeometry args={[size[0], size[1], 1, 1]} />
      <RoadShader {...shader} />
    </mesh>
  );
}

export default RoadShader;
