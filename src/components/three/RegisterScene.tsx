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
            col += vec3(0.0, 0.06, 0.08) * (1.0 - abs(h - 0.5) * 2.0);
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}

/** Estrellas estáticas alrededor del jugador. */
function Stars({ count = 1000 }: { count?: number }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 60 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.7);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = -Math.abs(r * Math.sin(phi) * Math.sin(theta)) - 5;
    }
    return pos;
  }, [count]);

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
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

const SEGMENT_LENGTH = 60;
const SEGMENT_RECYCLE_THRESHOLD = 30;
const SEGMENT_LOOP_DISTANCE = SEGMENT_LENGTH * 3;

/**
 * RoadScroller — la carretera ahora se compone de 3 segmentos físicos que se
 * mueven en world space y se reciclan cuando pasan la cámara. Esto evita el
 * flickering/epilepsia que producía el scroll UV del shader a alta velocidad:
 * el shader queda estático y la sensación de movimiento sale del transform
 * de los meshes, que es estable bit-a-bit.
 */
function RoadScroller({ speedRef }: { speedRef: React.MutableRefObject<number> }) {
  const ref0 = useRef<THREE.Mesh>(null);
  const ref1 = useRef<THREE.Mesh>(null);
  const ref2 = useRef<THREE.Mesh>(null);
  const refs = useMemo(() => [ref0, ref1, ref2], []);
  // Z físico de cada segmento. Empezamos con los segmentos consecutivos
  // detrás de la cámara para que aparezcan acercándose en cadena.
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
      if (newZ > SEGMENT_RECYCLE_THRESHOLD) {
        newZ -= SEGMENT_LOOP_DISTANCE;
      }
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
          <planeGeometry args={[40, SEGMENT_LENGTH, 1, 1]} />
          {/* speed=0 → sin scroll UV (el movimiento real viene del mesh).
              laneColor blanco para que el Bloom capture solo las líneas. */}
          <RoadShader
            speed={0}
            lanes={6}
            glowColor="#7000FF"
            laneColor="#FFFFFF"
          />
        </mesh>
      ))}
    </>
  );
}

/**
 * Side props (postes / árboles low-poly) que se reciclan en pool.
 * Comparten el `speedRef` con la carretera para que el paralax sea coherente.
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
  const loopDistance = items.length * 14;

  useFrame(() => {
    const speed = speedRef.current;
    refs.current.forEach((g) => {
      if (!g) return;
      g.position.z += speed;
      if (g.position.z > SEGMENT_RECYCLE_THRESHOLD) {
        g.position.z -= loopDistance;
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
 * useSpeedRamp — speed.current empieza en 0.03 y converge a 0.10 con lerp
 * suave (NUNCA más rápido). Esto fija el techo de velocidad y elimina
 * la epilepsia que producía la rampa anterior (hasta 1.6).
 */
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
  // Si el usuario prefiere reducir movimiento, casi detenemos el flujo.
  const target = reduced ? 0.015 : 0.1;
  const speedRef = useSpeedRamp(target);

  return (
    <>
      <color attach="background" args={['#04020F']} />
      {/* Fog denso: ahoga el horizonte y hace invisible el join de segmentos */}
      <fog attach="fog" args={['#04020F', 15, 70]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 6, -8]} intensity={28} color="#7000FF" distance={40} decay={2} />
      <pointLight position={[0, 1, -2]} intensity={6} color="#0AFFE0" distance={8} decay={2} />

      <SkyGradient />
      <Stars count={Math.floor(1000 * quality.particleScale)} />
      <RoadScroller speedRef={speedRef} />
      <SideProps speedRef={speedRef} />

      {quality.postprocessing && !reduced ? (
        <EffectComposer multisampling={0}>
          {/* Bloom con intensity 0.5 y threshold alto → solo las líneas
              blancas (laneColor #FFFFFF + emissive boost del shader) brillan. */}
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.2}
            mipmapBlur
          />
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
 * una carretera infinita compuesta de 3 segmentos físicos que se reciclan
 * (sin scroll UV del shader, sin motion blur, velocidad acotada a 0.10).
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
