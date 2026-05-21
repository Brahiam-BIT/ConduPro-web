import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface CarModelHandle {
  /** Grupo raíz del carro (para timelines GSAP externas). */
  group: THREE.Group | null;
  /** Inicia animación "arrancada": avanza y vuelve al punto de origen. */
  burst: () => void;
}

export interface CarModelProps {
  /** Color del cuerpo. */
  bodyColor?: string;
  /** Color de los faros. */
  headlightColor?: string;
  /** Activa el bob (oscilación vertical) idle. */
  bob?: boolean;
  /** Activa la rotación oscilante en Y. */
  swing?: boolean;
  /** Cuántos grados de oscilación Y (en radianes ya convertidos). */
  swingAmplitude?: number;
  /** Velocidad de rotación de las ruedas (rad/s). */
  wheelSpeed?: number;
  /** Posición base del carro. */
  position?: [number, number, number];
  /** Escala global. */
  scale?: number;
  /** Click handler externo (también puede dispararse vía `burst`). */
  onClick?: () => void;
}

const WHEEL_RADIUS = 0.32;
const WHEEL_WIDTH = 0.22;

/**
 * CarModel — carro construido con geometrías primitivas de Three.js
 * (sin GLTF). Cumple el spec del login:
 *   - Cuerpo, techo, ruedas, faros y parabrisas
 *   - Rim light + faros como point/spot lights
 *   - Idle: bob en Y + swing en Y
 *   - `burst()`: animación de arrancada controlada desde GSAP afuera
 *
 * Llamar dentro de un `<Canvas>`.
 */
export const CarModel = forwardRef<CarModelHandle, CarModelProps>(function CarModel(
  {
    bodyColor = '#7000FF',
    headlightColor = '#0AFFE0',
    bob = true,
    swing = true,
    swingAmplitude = (15 * Math.PI) / 180,
    wheelSpeed = 6,
    position = [0, WHEEL_RADIUS, 0],
    scale = 1,
    onClick,
  },
  ref,
) {
  const groupRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group>(null);
  const burstStateRef = useRef<{ active: boolean; t: number }>({ active: false, t: 0 });
  const timeRef = useRef(0);

  useImperativeHandle(
    ref,
    () => ({
      get group() {
        return groupRef.current;
      },
      burst: () => {
        burstStateRef.current = { active: true, t: 0 };
      },
    }),
    [],
  );

  // Materiales se memorizan para que se compartan y `dispose` sea predecible.
  const materials = useMemo(() => {
    const body = new THREE.MeshStandardMaterial({
      color: bodyColor,
      metalness: 0.85,
      roughness: 0.22,
      envMapIntensity: 1.0,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: '#0A0717',
      metalness: 0.4,
      roughness: 0.6,
    });
    const tire = new THREE.MeshStandardMaterial({
      color: '#08060F',
      metalness: 0.1,
      roughness: 0.95,
    });
    const rim = new THREE.MeshStandardMaterial({
      color: '#1A1535',
      metalness: 0.9,
      roughness: 0.25,
    });
    const headlight = new THREE.MeshStandardMaterial({
      color: headlightColor,
      emissive: headlightColor,
      emissiveIntensity: 3,
      metalness: 0.2,
      roughness: 0.1,
    });
    const tail = new THREE.MeshStandardMaterial({
      color: '#FF2D7A',
      emissive: '#FF2D7A',
      emissiveIntensity: 1.5,
    });
    const glass = new THREE.MeshPhysicalMaterial({
      color: '#0AFFE0',
      transmission: 0.7,
      thickness: 0.4,
      roughness: 0.05,
      metalness: 0,
      transparent: true,
      opacity: 0.55,
      ior: 1.45,
    });
    return { body, dark, tire, rim, headlight, tail, glass };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mantener color/headlight reactivos.
  materials.body.color.set(bodyColor);
  materials.headlight.color.set(headlightColor);
  materials.headlight.emissive.set(headlightColor);

  useFrame((_state, delta) => {
    const g = groupRef.current;
    const wheels = wheelsRef.current;
    if (!g) return;

    timeRef.current += delta;
    const t = timeRef.current;

    // Idle: swing en Y
    if (swing) {
      g.rotation.y = Math.sin(t * 0.6) * swingAmplitude;
    }
    // Idle: bob en Y
    if (bob) {
      g.position.y = position[1] + Math.sin(t * 1.6) * 0.05;
    }

    // Burst: pequeña aceleración hacia +Z y vuelta
    if (burstStateRef.current.active) {
      burstStateRef.current.t += delta;
      const bt = burstStateRef.current.t;
      const duration = 0.8;
      const p = Math.min(bt / duration, 1);
      // ease cubic-bezier(0.16, 1, 0.3, 1) aproximado con out-cubic
      const ease = 1 - Math.pow(1 - p, 3);
      const goForward = ease * (1 - ease) * 4; // sube y baja en 0..1
      g.position.z = position[2] + goForward * 1.6;
      if (p >= 1) {
        burstStateRef.current = { active: false, t: 0 };
        g.position.z = position[2];
      }
    }

    if (wheels) {
      wheels.children.forEach((wheel) => {
        wheel.rotation.x += delta * wheelSpeed;
      });
    }
  });

  // Helper para emitir hijos de las ruedas.
  const wheelOffsets: Array<[number, number, number]> = [
    [-0.95, 0, 1.2], // FL
    [0.95, 0, 1.2], // FR
    [-0.95, 0, -1.1], // RL
    [0.95, 0, -1.1], // RR
  ];

  return (
    <group ref={groupRef} position={position} scale={scale} onClick={onClick}>
      {/* Rim light arriba del carro */}
      <pointLight position={[0, 2.2, 0]} color="#0AFFE0" intensity={6} distance={6} decay={2} />

      {/* Cuerpo principal */}
      <mesh castShadow receiveShadow material={materials.body}>
        <boxGeometry args={[2.2, 0.65, 4.2]} />
      </mesh>

      {/* Fender flare (caja delgada para dar volumen) */}
      <mesh position={[0, -0.18, 0]} material={materials.dark}>
        <boxGeometry args={[2.25, 0.3, 4.25]} />
      </mesh>

      {/* Techo (más pequeño, ligeramente inclinado hacia atrás) */}
      <mesh position={[0, 0.55, -0.2]} rotation-x={-0.04} material={materials.body}>
        <boxGeometry args={[1.65, 0.55, 2.2]} />
      </mesh>

      {/* Parabrisas */}
      <mesh position={[0, 0.55, 0.95]} rotation-x={-Math.PI / 4} material={materials.glass}>
        <planeGeometry args={[1.5, 0.95]} />
      </mesh>

      {/* Luneta trasera */}
      <mesh position={[0, 0.55, -1.32]} rotation-x={Math.PI / 4} material={materials.glass}>
        <planeGeometry args={[1.5, 0.85]} />
      </mesh>

      {/* Faros delanteros (esferas pequeñas emisivas) */}
      <mesh position={[-0.7, 0.05, 2.05]} material={materials.headlight}>
        <sphereGeometry args={[0.16, 24, 24]} />
      </mesh>
      <mesh position={[0.7, 0.05, 2.05]} material={materials.headlight}>
        <sphereGeometry args={[0.16, 24, 24]} />
      </mesh>

      {/* SpotLights de los faros hacia adelante + point cyan dentro */}
      <pointLight position={[-0.7, 0.05, 2.1]} color={headlightColor} intensity={3} distance={2.5} decay={2} />
      <pointLight position={[0.7, 0.05, 2.1]} color={headlightColor} intensity={3} distance={2.5} decay={2} />
      <spotLight
        position={[-0.7, 0.05, 2.1]}
        target-position={[-0.7, -0.5, 6]}
        color={headlightColor}
        intensity={45}
        angle={0.45}
        penumbra={0.7}
        distance={14}
        decay={1.7}
      />
      <spotLight
        position={[0.7, 0.05, 2.1]}
        target-position={[0.7, -0.5, 6]}
        color={headlightColor}
        intensity={45}
        angle={0.45}
        penumbra={0.7}
        distance={14}
        decay={1.7}
      />

      {/* Stop traseros */}
      <mesh position={[-0.7, 0.1, -2.05]} material={materials.tail}>
        <boxGeometry args={[0.4, 0.1, 0.05]} />
      </mesh>
      <mesh position={[0.7, 0.1, -2.05]} material={materials.tail}>
        <boxGeometry args={[0.4, 0.1, 0.05]} />
      </mesh>

      {/* Ruedas */}
      <group ref={wheelsRef}>
        {wheelOffsets.map((p, i) => (
          <group key={i} position={p}>
            <mesh rotation-z={Math.PI / 2} material={materials.tire}>
              <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH, 24]} />
            </mesh>
            {/* Aro interior */}
            <mesh rotation-z={Math.PI / 2} position={[0, 0, 0]} material={materials.rim}>
              <cylinderGeometry args={[WHEEL_RADIUS * 0.55, WHEEL_RADIUS * 0.55, WHEEL_WIDTH * 1.02, 16]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
});

export default CarModel;
