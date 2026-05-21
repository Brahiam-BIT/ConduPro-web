import { useRef } from 'react';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import BrandCanvas from './BrandCanvas';
import CarModel, { type CarModelHandle } from './CarModel';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Estado interpolado que envía `HeroSection` al carro a través del
 * `useFrame` interno. Los valores van de "estado A" a "estado B" en
 * función del scroll global (manejado por GSAP ScrollTrigger fuera del canvas).
 */
export interface HeroSceneState {
  /** Progreso del scroll dentro del hero (0..1). */
  progress: number;
  /** Si el dispositivo es mobile (< 768px) — desactiva la coreografía. */
  isMobile: boolean;
}

const lerp = THREE.MathUtils.lerp;

/** Clamp helper para sub-rangos del scroll. */
function sub(p: number, from: number, to: number) {
  return THREE.MathUtils.clamp((p - from) / (to - from), 0, 1);
}

/**
 * CarChoreography — aplica las transformaciones cinematográficas al carro y
 * a la cámara según el progress del scroll.
 *
 * Tres tramos:
 *   0–30 %   zoom-in dramático (scale 1.0 → 1.8, rotY −15° → 0°, cam z 5 → 3.2)
 *   30–70 %  el carro se va a la derecha (x 0 → 2.5, rotY 0° → 20°, scale 1.8 → 1.4)
 *   70–100 % salida hacia abajo (y 0 → −1, opacity 1 → 0)
 *
 * En mobile la coreografía se desactiva — el carro queda en su estado inicial
 * con una rotación idle muy suave.
 */
function CarChoreography({ stateRef }: { stateRef: React.MutableRefObject<HeroSceneState> }) {
  const carRef = useRef<CarModelHandle>(null);
  const { camera } = useThree();
  const opacityRef = useRef(1);
  // Posición/escala objetivo — actualizadas cada frame en función del scroll.
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const { progress, isMobile } = stateRef.current;
    const group = carRef.current?.group;
    if (!group) return;

    if (isMobile) {
      // Idle suave en mobile (sin scroll choreography).
      const t = performance.now() / 1000;
      group.rotation.y = THREE.MathUtils.degToRad(-15) + Math.sin(t * 0.4) * 0.05;
      group.scale.setScalar(1);
      group.position.set(0, 0, 0);
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);
      return;
    }

    // Sub-rangos.
    const a = sub(progress, 0, 0.3); // zoom in
    const b = sub(progress, 0.3, 0.7); // movimiento a la derecha
    const c = sub(progress, 0.7, 1.0); // salida

    // Rotación Y: -15° → 0° → +20°.
    const rotY =
      lerp(THREE.MathUtils.degToRad(-15), 0, a) +
      lerp(0, THREE.MathUtils.degToRad(20), b);
    // Escala: 1.0 → 1.8 → 1.4.
    const scale = lerp(1.0, 1.8, a) - lerp(0, 0.4, b);
    // Posición X: 0 → 2.5 en el segundo tramo.
    const posX = lerp(0, 2.5, b);
    // Posición Y: salida hacia abajo en el último tramo.
    const posY = lerp(0, -1, c);
    // Cámara Z: 5 → 3.2 (zoom in real, no sólo escala).
    const camZ = lerp(5, 3.2, a);
    // Opacity (fade-out final).
    const opacity = lerp(1, 0, c);

    group.rotation.y = rotY;
    group.scale.setScalar(scale);
    targetPos.current.set(posX, posY, 0);
    group.position.lerp(targetPos.current, 0.18);

    camera.position.set(0, 0.4, camZ);
    camera.lookAt(0, 0, 0);

    // Opacity de todo el group (atravesando los materiales del .glb).
    if (opacity !== opacityRef.current) {
      opacityRef.current = opacity;
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const m = child.material as THREE.MeshStandardMaterial;
          if (!m.transparent && opacity < 1) m.transparent = true;
          m.opacity = opacity;
          m.depthWrite = opacity > 0.95;
        }
      });
    }
  });

  return <CarModel ref={carRef} bodyColor="#1C1C1E" idle={false} />;
}

export interface HeroSceneProps {
  /**
   * Ref que el padre actualiza con el progreso del scroll. El canvas lo lee
   * en `useFrame` para mantener el ciclo de render fuera de React.
   */
  stateRef: React.MutableRefObject<HeroSceneState>;
  className?: string;
}

/**
 * HeroScene — escena 3D del hero, estilo Apple product shot.
 *
 *  - Fondo negro puro (#000).
 *  - Iluminación cinematográfica de 3 puntos:
 *      key light (directional desde arriba-izquierda)
 *      rim light (point trasero derecho)
 *      fill light (point inferior)
 *  - `Environment preset="studio"` para reflejos limpios sobre el grafito.
 *  - Bloom muy sutil (threshold 0.8, intensity 0.3) sólo para bordes brillantes.
 *  - El carro lo coreografía `CarChoreography` a partir del `stateRef`.
 */
export function HeroScene({ stateRef, className }: HeroSceneProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <BrandCanvas
        camera={{ position: [0, 0.4, 5], fov: 32, near: 0.1, far: 50 }}
        background="#000000"
      >
        <color attach="background" args={['#000000']} />

        {/* Key light (desde arriba-izquierda) */}
        <directionalLight
          position={[-3, 4, 2]}
          intensity={1.2}
          color="#FFFFFF"
          castShadow
        />
        {/* Rim light (separa el carro del fondo) */}
        <pointLight position={[2, 1, -3]} intensity={0.6} color="#FFFFFF" />
        {/* Fill light desde abajo */}
        <pointLight position={[0, -2, 1]} intensity={0.15} color="#FFFFFF" />
        <ambientLight intensity={0.2} />

        <Environment preset="studio" />

        <CarChoreography stateRef={stateRef} />

        {!reduced ? (
          <EffectComposer multisampling={0}>
            <Bloom intensity={0.3} luminanceThreshold={0.8} luminanceSmoothing={0.2} mipmapBlur />
          </EffectComposer>
        ) : null}
      </BrandCanvas>
    </div>
  );
}

export default HeroScene;
