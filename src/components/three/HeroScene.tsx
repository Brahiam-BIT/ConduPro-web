import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import BrandCanvas from './BrandCanvas';
import { RoadShader } from './RoadShader';
import ParticlesField from './ParticlesField';
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/** Helper determinista para sembrar valores random reproducibles. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

interface CityProps {
  count?: number;
  side: 1 | -1;
  depth?: number;
}

/**
 * Edificios low-poly a los costados. Strips emisivos atenuados para no
 * gatillar el Bloom — antes pegaban como flashes cyan/violeta.
 */
function CityCluster({ count = 14, side, depth = 90 }: CityProps) {
  const buildings = useMemo(() => {
    const rng = seeded(side === 1 ? 1337 : 7331);
    const PALETTE_BODY = ['#1A1535', '#0D0A1E', '#241A4D', '#171134'];
    const PALETTE_GLOW = ['#0AFFE0', '#7000FF', '#A675FF', '#0AFFE0'];

    const arr: Array<{
      pos: [number, number, number];
      kind: 'box' | 'icos' | 'cone';
      h: number;
      w: number;
      color: string;
      glow: string;
    }> = [];
    for (let i = 0; i < count; i++) {
      const z = -i * (depth / count) - rng() * 2;
      const xJitter = rng() * 3;
      const x = side * (7 + xJitter);
      const h = 2 + rng() * 6;
      const w = 1 + rng() * 1.4;
      const kindRoll = rng();
      const kind: 'box' | 'icos' | 'cone' =
        kindRoll < 0.55 ? 'box' : kindRoll < 0.85 ? 'icos' : 'cone';
      const color = PALETTE_BODY[Math.floor(rng() * PALETTE_BODY.length)] ?? PALETTE_BODY[0]!;
      const glow = PALETTE_GLOW[Math.floor(rng() * PALETTE_GLOW.length)] ?? PALETTE_GLOW[0]!;
      arr.push({ pos: [x, h / 2, z], kind, h, w, color, glow });
    }
    return arr;
  }, [count, side, depth]);

  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i} position={b.pos}>
          {b.kind === 'box' ? (
            <mesh>
              <boxGeometry args={[b.w, b.h, b.w * 0.9]} />
              <meshStandardMaterial color={b.color} metalness={0.55} roughness={0.55} />
            </mesh>
          ) : null}
          {b.kind === 'icos' ? (
            <mesh>
              <icosahedronGeometry args={[b.w * 0.8, 0]} />
              <meshStandardMaterial color={b.color} metalness={0.5} roughness={0.5} flatShading />
            </mesh>
          ) : null}
          {b.kind === 'cone' ? (
            <mesh>
              <coneGeometry args={[b.w * 0.7, b.h, 6]} />
              <meshStandardMaterial color={b.color} metalness={0.45} roughness={0.6} flatShading />
            </mesh>
          ) : null}

          {/* Strip emisivo lateral — opacity bajada para no saturar el Bloom */}
          <mesh position={[side * -b.w * 0.51, 0, 0]} rotation-y={-side * (Math.PI / 2)}>
            <planeGeometry args={[b.w * 0.9, b.h * 0.06]} />
            <meshBasicMaterial color={b.glow} transparent opacity={0.4} />
          </mesh>
          <mesh position={[0, b.h * 0.55, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color={b.glow} transparent opacity={0.6} />
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

function MouseFollowLight({
  color = '#0AFFE0',
  intensity = 12,
  range = 5,
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

  return <pointLight ref={ref} color={color} intensity={intensity} distance={12} decay={2} />;
}

interface CameraParallaxProps {
  basePosition: [number, number, number];
  amplitudeDeg?: number;
  lookAt?: [number, number, number];
}

function CameraParallax({
  basePosition,
  amplitudeDeg = 4,
  lookAt = [0, 1.2, -20],
}: CameraParallaxProps) {
  const { camera, mouse } = useThree();
  const lookVec = useMemo(() => new THREE.Vector3(...lookAt), [lookAt]);
  const target = useRef(new THREE.Vector3(...basePosition));
  const amp = (amplitudeDeg * Math.PI) / 180;

  useFrame((_state, delta) => {
    const offsetX = Math.sin(-mouse.x * amp) * 1.2;
    const offsetY = mouse.y * amp * 0.4;
    target.current.set(basePosition[0] + offsetX, basePosition[1] + offsetY, basePosition[2]);
    const lerp = 1 - Math.pow(0.001, delta);
    camera.position.lerp(target.current, lerp);
    camera.lookAt(lookVec);
  });

  return null;
}

const SEGMENT_LENGTH = 80;
const SEGMENT_RECYCLE_THRESHOLD = 30;
const SEGMENT_LOOP_DISTANCE = SEGMENT_LENGTH * 3;

/**
 * RoadScroller — 3 segmentos físicos que se reciclan en world space.
 * Sin scroll UV del shader (speed=0), velocidad acotada vía `speedRef`:
 * 0.03 → 0.10 con lerp suave. Esto elimina el flicker que se veía con la
 * versión UV-scroll a alta velocidad.
 */
function RoadScroller({ speedRef }: { speedRef: React.MutableRefObject<number> }) {
  const ref0 = useRef<THREE.Mesh>(null);
  const ref1 = useRef<THREE.Mesh>(null);
  const ref2 = useRef<THREE.Mesh>(null);
  const refs = useMemo(() => [ref0, ref1, ref2], []);
  const positions = useRef<[number, number, number]>([
    0,
    -SEGMENT_LENGTH,
    -SEGMENT_LENGTH * 2,
  ]);

  useFrame(() => {
    const speed = speedRef.current;
    const next: [number, number, number] = [...positions.current] as [
      number,
      number,
      number,
    ];
    for (let i = 0; i < 3; i++) {
      let newZ = next[i] + speed;
      if (newZ > SEGMENT_RECYCLE_THRESHOLD) newZ -= SEGMENT_LOOP_DISTANCE;
      const m = refs[i].current;
      if (m) m.position.z = newZ;
      next[i] = newZ;
    }
    positions.current = next;
  });

  return (
    <>
      {refs.map((ref, i) => (
        <mesh
          key={i}
          ref={ref}
          rotation-x={-Math.PI / 2}
          position={[0, 0, positions.current[i]]}
        >
          <planeGeometry args={[36, SEGMENT_LENGTH, 1, 1]} />
          <RoadShader
            speed={0}
            lanes={6}
            laneColor="#FFFFFF"
            glowColor="#7000FF"
            asphaltColor="#04020F"
          />
        </mesh>
      ))}
    </>
  );
}

function useSpeedRamp(target = 0.1) {
  const speedRef = useRef(0.03);
  useFrame(() => {
    speedRef.current += (target - speedRef.current) * 0.005;
  });
  return speedRef;
}

function SceneBody() {
  const reduced = usePrefersReducedMotion();
  const quality = useAdaptiveQuality();
  const postprocessing = quality.postprocessing && !reduced;
  const target = reduced ? 0.015 : 0.1;
  const speedRef = useSpeedRamp(target);

  return (
    <>
      <color attach="background" args={['#04020F']} />
      {/* Fog denso: esconde el horizonte y mata el shimmer lejano */}
      <fog attach="fog" args={['#04020F', 12, 55]} />

      {/* Luces — bajadas para que el Bloom no las dispare como flash */}
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 12, -25]} intensity={22} color="#7000FF" distance={50} decay={2} />
      <pointLight position={[0, 2, 5]} intensity={6} color="#0AFFE0" distance={10} decay={2} />
      <MouseFollowLight color="#0AFFE0" intensity={10} range={5} height={2.4} />

      <CameraParallax basePosition={[0, 2.4, 4]} amplitudeDeg={4} lookAt={[0, 1.4, -25]} />

      {/* Carretera: 3 segmentos físicos */}
      <RoadScroller speedRef={speedRef} />

      {/* Edificios: menos densos */}
      <CityCluster side={-1} count={14} depth={80} />
      <CityCluster side={1} count={14} depth={80} />

      {/* Partículas: menos y más sutiles */}
      <ParticlesField
        count={900}
        particleScale={quality.particleScale}
        radius={22}
        size={0.035}
        dual
        opacity={0.45}
      />

      {/* Post-process: solo Bloom suave + Vignette. Sin ChromaticAberration
          (la AC sobre lanes blancos en movimiento provoca el shimmer percibido). */}
      {postprocessing ? (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.55} luminanceThreshold={0.6} luminanceSmoothing={0.2} mipmapBlur />
          <Vignette eskil={false} offset={0.25} darkness={0.65} />
        </EffectComposer>
      ) : null}
    </>
  );
}

export interface HeroSceneProps {
  className?: string;
}

/**
 * HeroScene — escena 3D del hero.
 *
 * Cambios vs. la versión "epiléptica" anterior:
 *  - Carretera = 3 segmentos físicos reciclados (NO scroll UV del shader).
 *  - Velocidad lerp 0.03 → 0.10 (techo bajo, sin más rampa).
 *  - Bloom intensity 0.55 con threshold 0.6 → sólo brillan las lane lines blancas.
 *  - Eliminada Chromatic Aberration (gatillaba shimmer con el motion del road).
 *  - Strips emisivos y antenas de los edificios al 40-60% de opacidad.
 *  - Partículas 2000 → 900 con opacity 0.45 (sin "tormenta" de puntos).
 *  - Fog (12, 55) más denso para tapar el horizonte y las uniones de segmentos.
 *  - Luces principales bajadas (~50% menos intensidad).
 *  - Camera parallax ±4° (antes ±5°).
 *
 * Todo el postprocessing se sigue apagando si baja el FPS o el usuario tiene
 * `prefers-reduced-motion`. En ese caso `target` cae a 0.015 (casi parado).
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
