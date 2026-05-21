import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import BrandCanvas from './BrandCanvas';
import { RoadShader } from './RoadShader';
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/** Cielo gradiente oscuro→violeta-cyan implementado con un shader de fondo. */
function SkyGradient() {
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color('#7000FF') },
      uMid: { value: new THREE.Color('#1A1535') },
      uBottom: { value: new THREE.Color('#04020F') },
    }),
    [],
  );

  return (
    <mesh scale={[1, 1, 1]} position={[0, 6, -90]}>
      <sphereGeometry args={[80, 32, 32]} />
      <shaderMaterial
        side={THREE.BackSide}
        uniforms={uniforms}
        depthWrite={false}
        vertexShader={/* glsl */ `
          varying vec3 vWorld;
          void main() {
            vWorld = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uTop;
          uniform vec3 uMid;
          uniform vec3 uBottom;
          varying vec3 vWorld;
          void main() {
            float h = clamp((vWorld.y / 80.0) * 0.5 + 0.5, 0.0, 1.0);
            vec3 col = mix(uBottom, uMid, smoothstep(0.0, 0.55, h));
            col = mix(col, uTop, smoothstep(0.55, 1.0, h));
            // Tinte cyan en el horizonte
            col += vec3(0.0, 0.06, 0.08) * (1.0 - abs(h - 0.5) * 2.0);
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}

/** Estrellas estáticas alrededor del jugador (puntos blancos/cyan). */
function Stars({ count = 1000 }: { count?: number }) {
  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 60 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      // Sólo hemisferio superior y trasero (-z hacia adelante para el jugador).
      const phi = Math.acos(Math.random() * 0.7); // 0..~45°
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = -Math.abs(r * Math.sin(phi) * Math.sin(theta)) - 5;
      sizes[i] = 0.04 + Math.random() * 0.12;
    }
    return { positions, sizes };
  }, [count]);

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        sizeAttenuation
        transparent
        opacity={0.9}
        color="#E8E8FF"
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Side props (postes / árboles low-poly) que viajan hacia la cámara.
 * Recicla los objetos cuando pasan detrás de la cámara reposicionándolos al
 * fondo (impl. estilo "object pool").
 */
function SideProps({ speedRef }: { speedRef: React.MutableRefObject<number> }) {
  const refs = useRef<THREE.Group[]>([]);
  const items = useMemo(() => {
    const arr: Array<{ side: 1 | -1; z: number; type: 'pole' | 'tree' }> = [];
    const total = 14;
    for (let i = 0; i < total; i++) {
      const side: 1 | -1 = i % 2 === 0 ? 1 : -1;
      arr.push({
        side,
        z: -i * 14 - Math.random() * 6,
        type: Math.random() > 0.5 ? 'pole' : 'tree',
      });
    }
    return arr;
  }, []);

  useFrame((_state, delta) => {
    const speed = speedRef.current;
    refs.current.forEach((g) => {
      if (!g) return;
      g.position.z += delta * speed;
      if (g.position.z > 8) {
        g.position.z -= items.length * 14;
      }
    });
  });

  return (
    <group>
      {items.map((it, idx) => (
        <group
          key={idx}
          ref={(el) => {
            if (el) refs.current[idx] = el;
          }}
          position={[it.side * 6.5, 0, it.z]}
        >
          {it.type === 'pole' ? (
            <>
              {/* Poste de luz futurista */}
              <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 3, 8]} />
                <meshStandardMaterial color="#1A1535" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[it.side * -0.4, 3, 0]}>
                <boxGeometry args={[0.8, 0.08, 0.18]} />
                <meshStandardMaterial color="#1A1535" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[it.side * -0.7, 2.92, 0]}>
                <sphereGeometry args={[0.12, 12, 12]} />
                <meshBasicMaterial color="#0AFFE0" />
              </mesh>
            </>
          ) : (
            <>
              {/* Árbol low-poly */}
              <mesh position={[0, 0.45, 0]}>
                <cylinderGeometry args={[0.18, 0.22, 0.9, 6]} />
                <meshStandardMaterial color="#0A0717" metalness={0.1} roughness={0.95} />
              </mesh>
              <mesh position={[0, 1.4, 0]}>
                <coneGeometry args={[0.65, 1.6, 6]} />
                <meshStandardMaterial color="#1F0B66" metalness={0.2} roughness={0.85} />
              </mesh>
              <mesh position={[0, 2.2, 0]}>
                <coneGeometry args={[0.45, 1.2, 6]} />
                <meshStandardMaterial color="#3A1F8C" metalness={0.2} roughness={0.85} />
              </mesh>
            </>
          )}
        </group>
      ))}
    </group>
  );
}

/**
 * RoadScroller — plano largo con `RoadShader` cuyo `speed` se controla
 * desde fuera (ramp-up). El plano está fijo en el mundo: el efecto de
 * movimiento sale del scroll de UV del shader.
 */
function RoadScroller({ speedRef }: { speedRef: React.MutableRefObject<number> }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, -40]}>
      <planeGeometry args={[40, 200, 1, 1]} />
      <RoadShader speedRef={speedRef} lanes={6} glowColor="#7000FF" laneColor="#0AFFE0" />
    </mesh>
  );
}

/** Hook que mantiene un ref con el speed acelerado de 0→target en `ramp` segundos. */
function useSpeedRamp(target: number, ramp: number) {
  const speedRef = useRef(0);
  useFrame((_state, delta) => {
    const t = speedRef.current;
    if (t >= target) return;
    speedRef.current = Math.min(target, t + (delta * target) / ramp);
  });
  return speedRef;
}

function SceneBody() {
  const reduced = usePrefersReducedMotion();
  const quality = useAdaptiveQuality();
  const target = reduced ? 0.25 : 1.6;
  const speedRef = useSpeedRamp(target, 3);

  return (
    <>
      <color attach="background" args={['#04020F']} />
      <fog attach="fog" args={['#04020F', 18, 90]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 6, -8]} intensity={28} color="#7000FF" distance={40} decay={2} />
      <pointLight position={[0, 1, -2]} intensity={6} color="#0AFFE0" distance={8} decay={2} />

      <SkyGradient />
      <Stars count={Math.floor(1000 * quality.particleScale)} />
      <RoadScroller speedRef={speedRef} />
      <SideProps speedRef={speedRef} />

      {quality.postprocessing && !reduced ? (
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.2} luminanceThreshold={0.4} luminanceSmoothing={0.25} mipmapBlur />
          <Vignette eskil={false} offset={0.25} darkness={0.75} />
        </EffectComposer>
      ) : null}
    </>
  );
}

export interface RegisterSceneProps {
  className?: string;
}

/**
 * RegisterScene — vista en primera persona desde el carro, viajando por
 * una carretera infinita. La cámara queda baja (altura 1.2) mirando al
 * horizonte, donde la luz violeta y las estrellas dan una atmósfera de
 * "viaje al amanecer".
 *
 * Componente client-only por usar shaders + postprocessing.
 */
export function RegisterScene({ className }: RegisterSceneProps) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <BrandCanvas
        camera={{ position: [0, 1.2, 2], fov: 70, near: 0.1, far: 200 }}
        background="#04020F"
      >
        <SceneBody />
      </BrandCanvas>
    </div>
  );
}

export default RegisterScene;
