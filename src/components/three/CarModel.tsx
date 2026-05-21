import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MODEL_URL = '/models/car.glb';

useGLTF.preload(MODEL_URL);

export interface CarModelHandle {
  /** Grupo raíz del carro (para animaciones externas — GSAP ScrollTrigger). */
  group: THREE.Group | null;
}

export interface CarModelProps {
  /** Color principal de la carrocería. Default = "Space Black" grafito. */
  bodyColor?: string;
  /** Habilita un idle bob muy sutil. Default false (queremos quietud Apple). */
  idle?: boolean;
  /** Tamaño normalizado (dimensión mayor). Default 2.5. */
  targetSize?: number;
  /** Posición base. */
  position?: [number, number, number];
}

/**
 * CarModel — carga `public/models/car.glb` y lo re-materializa con un
 * `MeshStandardMaterial` grafito (Apple "Space Black"):
 *   metalness 0.9 / roughness 0.1 / envMapIntensity 1.0
 *
 * Centrado y escalado automáticamente con `Box3` para asegurarse de que
 * cabe en una caja unitaria del tamaño deseado, independientemente del
 * tamaño original del GLB.
 *
 * Expone únicamente `group` (no `burst()` u otras animaciones internas):
 * la coreografía del hero la maneja `HeroSection` con GSAP ScrollTrigger.
 */
export const CarModel = forwardRef<CarModelHandle, CarModelProps>(function CarModel(
  { bodyColor = '#1C1C1E', idle = false, targetSize = 2.5, position = [0, 0, 0] },
  ref,
) {
  const { scene } = useGLTF(MODEL_URL) as unknown as { scene: THREE.Group };
  const groupRef = useRef<THREE.Group>(null);

  useImperativeHandle(
    ref,
    () => ({
      get group() {
        return groupRef.current;
      },
    }),
    [],
  );

  // Materials que creamos imperativamente — los disponemos en unmount.
  const created = useMemo(() => ({ materials: [] as THREE.Material[] }), []);

  useEffect(() => {
    if (!scene) return;
    const baseColor = new THREE.Color(bodyColor);

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mat = new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: 0.9,
        roughness: 0.1,
        envMapIntensity: 1.0,
      });
      child.material = mat;
      child.castShadow = true;
      child.receiveShadow = true;
      created.materials.push(mat);
    });

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const sizeBox = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(sizeBox.x, sizeBox.y, sizeBox.z) || 1;
    const scale = targetSize / maxDim;
    scene.scale.setScalar(scale);
    scene.position.sub(center.multiplyScalar(scale));
  }, [scene, bodyColor, targetSize, created]);

  useEffect(() => {
    return () => {
      created.materials.forEach((m) => m.dispose());
    };
  }, [created]);

  // Optional idle bob — apagado por defecto para look "producto Apple".
  useFrame((state) => {
    const g = groupRef.current;
    if (!g || !idle) return;
    g.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.7) * 0.02;
  });

  return (
    <group ref={groupRef} position={position}>
      <primitive object={scene} />
    </group>
  );
});

export default CarModel;
