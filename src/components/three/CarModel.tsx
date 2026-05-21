import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';

const MODEL_URL = '/models/car.glb';

// Pre-carga el modelo para evitar pop-in la primera vez que se monta la escena.
useGLTF.preload(MODEL_URL);

export interface CarModelHandle {
  /** Grupo raíz del carro (para timelines GSAP externas). */
  group: THREE.Group | null;
  /** Lanza la "arrancada": empuje en Z + spin de 360° sobre Y. */
  burst: () => void;
}

export interface CarModelProps {
  /** Tinte metálico que se aplica al cuerpo. Si el material original tenía color, lo respeta. */
  bodyColor?: string;
  /** Habilita bob vertical idle. Default true. */
  bob?: boolean;
  /**
   * @deprecated mantenido por compatibilidad con el sandbox anterior.
   * El swing del carro ahora lo controla el parallax del mouse.
   */
  swing?: boolean;
  /** Tamaño "lógico" objetivo del modelo en unidades world (dim mayor). Default 2.5. */
  targetSize?: number;
  /** Posición base. */
  position?: [number, number, number];
  /** Click handler externo (el burst también puede llamarse vía `ref.burst()`). */
  onClick?: () => void;
}

/**
 * CarModel — carga `public/models/car.glb` con `useGLTF`, re-materializa las
 * mallas con `MeshStandardMaterial` metálico (respetando colores originales),
 * y aplica:
 *
 *   - Centrado y normalización automática (Box3 → max dim → scale uniform).
 *   - Bob suave en Y con `Math.sin(time)`.
 *   - Mouse parallax leve (rotación Y / X) basado en el mouse global de window.
 *   - Click → "arrancada" GSAP: empuje en Z + spin de 360° en Y.
 *
 * Expone un `ref` con `group` (para timelines externas) y `burst()` (para
 * dispararse desde otros componentes — ej. el sandbox `/dev/three-test`).
 */
export const CarModel = forwardRef<CarModelHandle, CarModelProps>(function CarModel(
  { bodyColor, bob = true, targetSize = 2.5, position = [0, 0, 0], onClick },
  ref,
) {
  const { scene } = useGLTF(MODEL_URL) as unknown as { scene: THREE.Group };
  const groupRef = useRef<THREE.Group>(null);
  const targetRot = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });
  const { size } = useThree();

  // Guardar handle de la timeline activa para limpiarla en unmount.
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const burst = () => {
    const g = groupRef.current;
    if (!g) return;
    tlRef.current?.kill();
    const baseZ = position[2];
    const startRotY = g.rotation.y;
    tlRef.current = gsap
      .timeline()
      .to(g.position, { z: baseZ + 1.5, duration: 0.3, ease: 'power2.in' })
      .to(g.position, { z: baseZ, duration: 0.6, ease: 'power2.out' })
      .to(
        g.rotation,
        {
          y: startRotY + Math.PI * 2,
          duration: 0.9,
          ease: 'power2.inOut',
        },
        '<0.1',
      );
  };

  useImperativeHandle(
    ref,
    () => ({
      get group() {
        return groupRef.current;
      },
      burst,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Mouse global (usamos window porque el canvas puede ocupar sólo la mitad
  // de la pantalla en el login y queremos que reaccione al mouse del page entero).
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / size.width - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / size.height - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [size.width, size.height]);

  // Re-materializar y normalizar el modelo. Guarda referencia a los materials
  // y geometries creados para liberar GPU en unmount.
  const created = useMemo(
    () => ({ materials: [] as THREE.Material[], geometries: [] as THREE.BufferGeometry[] }),
    [],
  );

  useEffect(() => {
    if (!scene) return;

    const tintColor = bodyColor ? new THREE.Color(bodyColor) : null;

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      // Tomar el color del material original si existe; si no, fallback brand.
      const original = child.material as THREE.Material | THREE.Material[] | undefined;
      const sample = Array.isArray(original) ? original[0] : original;
      const baseColor =
        sample && 'color' in sample && sample.color instanceof THREE.Color
          ? sample.color.clone()
          : new THREE.Color('#7000FF');

      const finalColor = tintColor ? baseColor.lerp(tintColor, 0.5) : baseColor;

      const mat = new THREE.MeshStandardMaterial({
        color: finalColor,
        metalness: 0.85,
        roughness: 0.15,
        envMapIntensity: 1.5,
      });
      child.material = mat;
      child.castShadow = true;
      child.receiveShadow = true;
      created.materials.push(mat);
      if (child.geometry) {
        created.geometries.push(child.geometry);
      }
    });

    // Centrar y escalar uniformemente al tamaño deseado.
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const sizeBox = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(sizeBox.x, sizeBox.y, sizeBox.z) || 1;
    const scale = targetSize / maxDim;
    scene.scale.setScalar(scale);
    scene.position.sub(center.multiplyScalar(scale));
  }, [scene, bodyColor, targetSize, created]);

  // Cleanup: disponer materials para liberar GPU al desmontar.
  useEffect(() => {
    return () => {
      tlRef.current?.kill();
      created.materials.forEach((m) => m.dispose());
      // Las geometries vienen del .glb cacheado; NO las disponemos para que
      // useGLTF pueda reusarlas si el modelo vuelve a montarse.
    };
  }, [created]);

  // Idle bob + mouse parallax (lerp suave).
  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.getElapsedTime();
    if (bob) g.position.y = position[1] + Math.sin(t * 0.7) * 0.06;

    targetRot.current.y += (mouseRef.current.x * 0.3 - targetRot.current.y) * 0.05;
    targetRot.current.x += (mouseRef.current.y * 0.1 - targetRot.current.x) * 0.05;
    g.rotation.y = targetRot.current.y;
    g.rotation.x = targetRot.current.x;
  });

  return (
    <group ref={groupRef} position={position} onClick={onClick ?? burst}>
      <primitive object={scene} />
    </group>
  );
});

export default CarModel;
