import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MODEL_URL = '/models/car.glb';

useGLTF.preload(MODEL_URL);

export interface CarModelHandle {
  group: THREE.Group | null;
}

export interface CarModelProps {
  bodyColor?: string;
  idle?: boolean;
  targetSize?: number;
  position?: [number, number, number];
  /** `hero` = materiales suaves sin reflejos quemados (landing). */
  variant?: 'default' | 'hero';
}

function isGlassMesh(name: string) {
  const n = name.toLowerCase();
  return (
    n.includes('glass') ||
    n.includes('window') ||
    n.includes('windshield') ||
    n.includes('windscreen') ||
    n.includes('lamp') ||
    n.includes('light') ||
    n.includes('chrome') ||
    n.includes('mirror')
  );
}

export const CarModel = forwardRef<CarModelHandle, CarModelProps>(function CarModel(
  {
    bodyColor = '#1C1C1E',
    idle = false,
    targetSize = 2.5,
    position = [0, 0, 0],
    variant = 'default',
  },
  ref,
) {
  const { scene } = useGLTF(MODEL_URL) as unknown as { scene: THREE.Group };
  const groupRef = useRef<THREE.Group>(null);

  /** Clon por instancia: el asset en caché de drei no debe mutarse (materiales, escala, opacidad). */
  const model = useMemo(() => scene.clone(true), [scene]);

  useImperativeHandle(
    ref,
    () => ({
      get group() {
        return groupRef.current;
      },
    }),
    [],
  );

  const created = useMemo(() => ({ materials: [] as THREE.Material[] }), []);

  useEffect(() => {
    if (!model) return;
    const baseColor = new THREE.Color(bodyColor);
    const hero = variant === 'hero';

    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      const glass = isGlassMesh(child.name);

      let mat: THREE.MeshStandardMaterial;

      if (hero && glass) {
        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#1a1a22'),
          metalness: 0.9,
          roughness: 0.12,
          envMapIntensity: 0.65,
          transparent: true,
          opacity: 0.88,
        });
      } else if (hero) {
        mat = new THREE.MeshStandardMaterial({
          color: baseColor,
          metalness: 0.72,
          roughness: 0.22,
          envMapIntensity: 0.9,
        });
      } else {
        mat = new THREE.MeshStandardMaterial({
          color: baseColor,
          metalness: 0.85,
          roughness: 0.15,
          envMapIntensity: 0.8,
        });
      }

      child.material = mat;
      child.castShadow = false;
      child.receiveShadow = false;
      created.materials.push(mat);
    });

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const sizeBox = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(sizeBox.x, sizeBox.y, sizeBox.z) || 1;
    const scale = targetSize / maxDim;
    model.scale.setScalar(scale);
    model.position.sub(center.multiplyScalar(scale));
  }, [model, bodyColor, targetSize, created, variant]);

  useEffect(() => {
    return () => {
      created.materials.forEach((m) => m.dispose());
    };
  }, [created]);

  useFrame((state) => {
    const g = groupRef.current;
    if (!g || !idle) return;
    g.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.7) * 0.02;
  });

  return (
    <group ref={groupRef} position={position}>
      <primitive object={model} />
    </group>
  );
});

export default CarModel;
