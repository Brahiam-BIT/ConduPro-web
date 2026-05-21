import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import BrandCanvas from './BrandCanvas';
import { RoadShader } from './RoadShader';
import ParticlesField from './ParticlesField';
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/** Pequeño helper determinista para sembrar valores random reproducibles. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

interface CityProps {
  /** Cantidad de edificios a cada lado. */
  count?: number;
  /** Lado (-1 izquierda, 1 derecha). */
  side: 1 | -1;
  /** Profundidad máxima en -Z. */
  depth?: number;
}

/**
 * Edificios low-poly a los costados de la carretera, hechos con primitivas
 * (Icosahedron/Cone/Box) para tener una silueta sci-fi sin GLTF.
 */
function CityCluster({ count = 18, side, depth = 80 }: CityProps) {
  const groupRef = useRef<THREE.Group>(null);
  const buildings = useMemo(() => {
    const rng = seeded(side === 1 ? 1337 : 7331);
    const arr: Array<{
      pos: [number, number, number];
      kind: 'box' | 'icos' | 'cone';
      h: number;
      w: number;
      color: string;
      glow: string;
    }> = [];
    const PALETTE_BODY = ['#1A1535', '#0D0A1E', '#241A4D', '#171134'];
    const PALETTE_GLOW = ['#0AFFE0', '#7000FF', '#A675FF', '#0AFFE0'];

    for (let i = 0; i < count; i++) {
      const z = -i * (depth / count) - rng() * 2;
      const xJitter = rng() * 3;
      const x = side * (7 + xJitter);
      const h = 2 + rng() * 6;
      const w = 1 + rng() * 1.4;
      const kindRoll = rng();
      const kind: CityProps extends never ? never : 'box' | 'icos' | 'cone' =
        kindRoll < 0.55 ? 'box' : kindRoll < 0.85 ? 'icos' : 'cone';
      const color = PALETTE_BODY[Math.floor(rng() * PALETTE_BODY.length)] ?? PALETTE_BODY[0]!;
      const glow = PALETTE_GLOW[Math.floor(rng() * PALETTE_GLOW.length)] ?? PALETTE_GLOW[0]!;
      arr.push({ pos: [x, h / 2, z], kind, h, w, color, glow });
    }
    return arr;
  }, [count, side, depth]);

  return (
    <group ref={groupRef}>
      {buildings.map((b, i) => (
        <group key={i} position={b.pos}>
          {b.kind === 'box' ? (
            <mesh>
              <boxGeometry args={[b.w, b.h, b.w * 0.9]} />
              <meshStandardMaterial color={b.color} metalness={0.6} roughness={0.45} />
            </mesh>
          ) : null}
          {b.kind === 'icos' ? (
            <mesh>
              <icosahedronGeometry args={[b.w * 0.8, 0]} />
              <meshStandardMaterial color={b.color} metalness={0.55} roughness={0.4} flatShading />
            </mesh>
          ) : null}
          {b.kind === 'cone' ? (
            <mesh>
              <coneGeometry args={[b.w * 0.7, b.h, 6]} />
              <meshStandardMaterial color={b.color} metalness={0.5} roughness={0.5} flatShading />
            </mesh>
          ) : null}

          {/* Strip emisivo en la fachada para sensación cyberpunk */}
          <mesh position={[side * -b.w * 0.51, 0, 0]} rotation-y={-side * (Math.PI / 2)}>
            <planeGeometry args={[b.w * 0.9, b.h * 0.08]} />
            <meshBasicMaterial color={b.glow} transparent opacity={0.85} />
          </mesh>
          {/* Punto de antena */}
          <mesh position={[0, b.h * 0.55, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color={b.glow} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

interface MouseFollowLightProps {
  color?: string;
  intensity?: number;
  range?: number;
  height?: number;
}

/** PointLight cyan que sigue al mouse en el plano XZ (lerp suave). */
function MouseFollowLight({
  color = '#0AFFE0',
  intensity = 20,
  range = 6,
  height = 2.2,
}: MouseFollowLightProps) {
  const ref = useRef<THREE.PointLight>(null);
  const { mouse } = useThree();
  const target = useRef(new THREE.Vector3(0, height, 0));

  useFrame((_state, delta) => {
    const l = ref.current;
    if (!l) return;
    target.current.set(mouse.x * range, height, mouse.y * range * 0.6 - 2);
    const lerp = 1 - Math.pow(0.001, delta);
    l.position.lerp(target.current, lerp);
  });

  return <pointLight ref={ref} color={color} intensity={intensity} distance={14} decay={2} />;
}

interface CameraParallaxProps {
  basePosition: [number, number, number];
  amplitudeDeg?: number;
  lookAt?: [number, number, number];
}

/** Parallax suave en la cámara siguiendo el mouse (±amplitudeDeg). */
function CameraParallax({ basePosition, amplitudeDeg = 5, lookAt = [0, 1.2, -20] }: CameraParallaxProps) {
  const { camera, mouse } = useThree();
  const lookVec = useMemo(() => new THREE.Vector3(...lookAt), [lookAt]);
  const target = useRef(new THREE.Vector3(...basePosition));
  const amp = (amplitudeDeg * Math.PI) / 180;

  useFrame((_state, delta) => {
    const offsetX = Math.sin(-mouse.x * amp) * 1.6;
    const offsetY = mouse.y * amp * 0.6;
    target.current.set(basePosition[0] + offsetX, basePosition[1] + offsetY, basePosition[2]);
    const lerp = 1 - Math.pow(0.001, delta);
    camera.position.lerp(target.current, lerp);
    camera.lookAt(lookVec);
  });

  return null;
}

function SceneBody() {
  const reduced = usePrefersReducedMotion();
  const quality = useAdaptiveQuality();
  const postprocessing = quality.postprocessing && !reduced;
  const caOffset = useMemo(() => new THREE.Vector2(0.001, 0.001), []);

  return (
    <>
      <color attach="background" args={['#04020F']} />
      <fog attach="fog" args={['#04020F', 14, 70]} />

      {/* Luces */}
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 12, -30]} intensity={50} color="#7000FF" distance={60} decay={2} />
      <pointLight position={[0, 2, 5]} intensity={10} color="#0AFFE0" distance={14} decay={2} />
      <MouseFollowLight color="#0AFFE0" intensity={18} range={5} height={2.4} />

      {/* Parallax sutil ±5° (spec) */}
      <CameraParallax basePosition={[0, 2.4, 4]} amplitudeDeg={5} lookAt={[0, 1.4, -25]} />

      {/* Carretera futurista vista diagonal con líneas en loop */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -40]}>
        <planeGeometry args={[36, 200, 1, 1]} />
        <RoadShader
          speed={1.2}
          lanes={6}
          laneColor="#0AFFE0"
          glowColor="#7000FF"
          asphaltColor="#04020F"
        />
      </mesh>

      {/* Edificios low-poly a ambos costados */}
      <CityCluster side={-1} count={20} depth={90} />
      <CityCluster side={1} count={20} depth={90} />

      {/* Partículas cyan flotantes (spec: 2000) */}
      <ParticlesField
        count={2000}
        particleScale={quality.particleScale}
        radius={22}
        size={0.045}
        dual
        opacity={0.85}
      />

      {/* Post-processing: Bloom 0.8 + ChromaticAberration leve */}
      {postprocessing ? (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.8} luminanceThreshold={0.45} luminanceSmoothing={0.25} mipmapBlur />
          <ChromaticAberration
            offset={caOffset}
            radialModulation={false}
            modulationOffset={0}
            blendFunction={BlendFunction.NORMAL}
          />
          <Vignette eskil={false} offset={0.2} darkness={0.6} />
        </EffectComposer>
      ) : null}
    </>
  );
}

export interface HeroSceneProps {
  className?: string;
}

/**
 * HeroScene — escena 3D principal del hero de la landing.
 *
 * Composición:
 *  - Carretera diagonal con líneas que se mueven hacia la cámara (loop infinito).
 *  - Edificios low-poly violetas a los costados (icosaedros, conos, cajas).
 *  - 2000 partículas cyan/violeta flotantes.
 *  - Fog #04020F para disolver el fondo.
 *  - PointLight cyan siguiendo al mouse + parallax ±5° en cámara.
 *  - Bloom + ChromaticAberration + Vignette.
 *
 * Todo el postprocessing se apaga automáticamente cuando el FPS baja o
 * el usuario tiene `prefers-reduced-motion`.
 */
export function HeroScene({ className }: HeroSceneProps) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <BrandCanvas
        camera={{ position: [0, 2.4, 4], fov: 60, near: 0.1, far: 150 }}
        background="#04020F"
      >
        <SceneBody />
      </BrandCanvas>
    </div>
  );
}

export default HeroScene;
