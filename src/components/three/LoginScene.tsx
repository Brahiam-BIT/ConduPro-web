import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, MeshReflectorMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import BrandCanvas from './BrandCanvas';
import CarModel, { type CarModelHandle } from './CarModel';
import ParticlesField from './ParticlesField';
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface CameraRigProps {
  /** Posición base de la cámara. */
  basePosition?: [number, number, number];
  /** Amplitud del parallax en grados. */
  amplitudeDeg?: number;
  /** Punto al que mira la cámara. */
  lookAt?: [number, number, number];
}

/**
 * CameraRig — aplica parallax suave en la cámara siguiendo el mouse.
 * Pivota alrededor del `lookAt` con lerp para sentirse "cinematográfico".
 */
function CameraRig({
  basePosition = [4, 2.1, 6],
  amplitudeDeg = 10,
  lookAt = [0, 0.5, 0],
}: CameraRigProps) {
  const { camera, mouse } = useThree();
  const targetPosition = useRef(new THREE.Vector3(...basePosition));
  const lookAtVec = new THREE.Vector3(...lookAt);
  const amp = (amplitudeDeg * Math.PI) / 180;

  useEffect(() => {
    camera.position.set(...basePosition);
    camera.lookAt(lookAtVec);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_state, delta) => {
    // mouse.x / mouse.y vienen normalizados a [-1, 1].
    const yaw = -mouse.x * amp;
    const pitch = mouse.y * amp * 0.5;
    const r = Math.hypot(basePosition[0] - lookAt[0], basePosition[2] - lookAt[2]);
    const baseAngle = Math.atan2(basePosition[2] - lookAt[2], basePosition[0] - lookAt[0]);
    const a = baseAngle + yaw * 0.6;

    targetPosition.current.x = lookAt[0] + Math.cos(a) * r;
    targetPosition.current.z = lookAt[2] + Math.sin(a) * r;
    targetPosition.current.y = basePosition[1] + pitch;

    const lerpFactor = 1 - Math.pow(0.001, delta);
    camera.position.lerp(targetPosition.current, lerpFactor);
    camera.lookAt(lookAtVec);
  });

  return null;
}

interface MouseFollowLightProps {
  color?: string;
  intensity?: number;
  height?: number;
  range?: number;
}

/**
 * MouseFollowLight — PointLight que sigue al mouse en el plano XZ con lerp.
 * El spec lo pide para HeroScene pero también queda muy bien en LoginScene.
 */
function MouseFollowLight({
  color = '#0AFFE0',
  intensity = 18,
  height = 1.4,
  range = 6,
}: MouseFollowLightProps) {
  const lightRef = useRef<THREE.PointLight>(null);
  const { mouse } = useThree();
  const target = useRef(new THREE.Vector3(0, height, 0));

  useFrame((_state, delta) => {
    const light = lightRef.current;
    if (!light) return;
    target.current.set(mouse.x * range, height, mouse.y * range * 0.6);
    const lerpFactor = 1 - Math.pow(0.001, delta);
    light.position.lerp(target.current, lerpFactor);
  });

  return <pointLight ref={lightRef} color={color} intensity={intensity} distance={10} decay={2} />;
}

/** Líneas de carril estáticas pintadas como planos delgados emisivos. */
function StaticLaneLines() {
  // 6 carriles a la izquierda y a la derecha del carro.
  const stripes: Array<{ x: number; length: number; opacity: number }> = [];
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    stripes.push({ x: i * 1.6, length: 18, opacity: i % 2 === 0 ? 0.6 : 0.25 });
  }
  return (
    <group position={[0, 0.011, 0]}>
      {stripes.map((s, idx) => (
        <mesh key={idx} rotation-x={-Math.PI / 2} position={[s.x, 0, 0]}>
          <planeGeometry args={[0.05, s.length]} />
          <meshBasicMaterial color="#0AFFE0" transparent opacity={s.opacity * 0.6} />
        </mesh>
      ))}
    </group>
  );
}

export interface LoginSceneProps {
  /** Color del cuerpo del carro. */
  bodyColor?: string;
  /** Tip de calidad inicial (la escena lo refina con `useAdaptiveQuality`). */
  className?: string;
}

/**
 * LoginScene — escena 3D para la página de login.
 *
 * Composición:
 *  - Carro `CarModel` central (click → burst).
 *  - Piso `MeshReflectorMaterial` (refleja el carro y los faros).
 *  - Carriles estáticos cyan.
 *  - Rim light superior violeta + faros + ambient tenue + mouse-follow cyan.
 *  - Mouse parallax en la cámara (CameraRig).
 *  - Post: Bloom intenso (threshold 0.5, intensity 1.5) + Vignette + ChromaticAberration leve.
 *
 * El postprocessing se apaga si `useAdaptiveQuality` reporta tier ≠ "high"
 * o si el usuario tiene `prefers-reduced-motion`.
 */
export function LoginScene({ bodyColor = '#7000FF', className }: LoginSceneProps) {
  const carRef = useRef<CarModelHandle>(null);
  const reduced = usePrefersReducedMotion();

  const handleBurst = () => {
    carRef.current?.burst();
  };

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <BrandCanvas
        camera={{ position: [4, 2.1, 6], fov: 45 }}
        onPointerDown={handleBurst}
        background="#04020F"
      >
        <SceneBody bodyColor={bodyColor} carRef={carRef} reduced={reduced} />
      </BrandCanvas>
    </div>
  );
}

function SceneBody({
  bodyColor,
  carRef,
  reduced,
}: {
  bodyColor: string;
  carRef: React.RefObject<CarModelHandle>;
  reduced: boolean;
}) {
  const quality = useAdaptiveQuality();
  const postprocessing = quality.postprocessing && !reduced;
  const caOffset = useMemo(() => new THREE.Vector2(0.0008, 0.0008), []);

  return (
    <>
      <color attach="background" args={['#04020F']} />
      <fog attach="fog" args={['#04020F', 10, 32]} />

      {/* Luces base */}
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 5, 0]} color="#7000FF" intensity={28} distance={18} decay={2} />
      <pointLight position={[0, 1.2, 7]} color="#0AFFE0" intensity={12} distance={12} decay={2} />
      <MouseFollowLight color="#0AFFE0" intensity={16} height={1.6} range={5} />

      {/* Mouse parallax */}
      <CameraRig basePosition={[4, 2.1, 6]} amplitudeDeg={10} lookAt={[0, 0.5, 0]} />

      {/* Carriles estáticos en el piso */}
      <StaticLaneLines />

      {/* Carro */}
      <CarModel
        ref={carRef}
        bodyColor={bodyColor}
        bob={!reduced}
        swing={!reduced}
        onClick={() => carRef.current?.burst()}
      />

      {/* Partículas sutiles flotantes */}
      <ParticlesField
        count={500}
        particleScale={quality.particleScale}
        radius={14}
        size={0.035}
        dual
        opacity={0.55}
      />

      {/* Piso reflectivo */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          mirror={0.45}
          blur={[400, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={1.4}
          roughness={0.85}
          depthScale={0.6}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0A0717"
          metalness={0.55}
        />
      </mesh>

      <Environment preset="city" />

      {postprocessing ? (
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.5}
            luminanceSmoothing={0.2}
            mipmapBlur
          />
          <ChromaticAberration
            offset={caOffset}
            radialModulation={false}
            modulationOffset={0}
            blendFunction={BlendFunction.NORMAL}
          />
          <Vignette eskil={false} offset={0.2} darkness={0.7} />
        </EffectComposer>
      ) : null}
    </>
  );
}

export default LoginScene;
