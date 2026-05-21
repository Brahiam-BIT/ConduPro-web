import { useRef } from 'react';
import { Environment, MeshReflectorMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import BrandCanvas from './BrandCanvas';
import CarModel, { type CarModelHandle } from './CarModel';
import { useAdaptiveQuality } from '@/hooks/useAdaptiveQuality';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/** Líneas decorativas estáticas a los costados del carro. */
function StaticLaneLines() {
  return (
    <group position={[0, -0.84, 0]}>
      {/* Carril izquierdo */}
      <mesh rotation-x={-Math.PI / 2} position={[-2.4, 0, 0]}>
        <planeGeometry args={[0.08, 24]} />
        <meshBasicMaterial color="#0AFFE0" transparent opacity={0.3} />
      </mesh>
      {/* Carril derecho */}
      <mesh rotation-x={-Math.PI / 2} position={[2.4, 0, 0]}>
        <planeGeometry args={[0.08, 24]} />
        <meshBasicMaterial color="#0AFFE0" transparent opacity={0.3} />
      </mesh>
      {/* Línea central discontinua (decorativa) */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh
          key={i}
          rotation-x={-Math.PI / 2}
          position={[0, 0, -10 + i * 3.2]}
        >
          <planeGeometry args={[0.05, 1.2]} />
          <meshBasicMaterial color="#0AFFE0" transparent opacity={0.18} />
        </mesh>
      ))}
    </group>
  );
}

export interface LoginSceneProps {
  /** Tinte opcional del carro (se mezcla con los colores originales del .glb). */
  bodyColor?: string;
  className?: string;
}

/**
 * LoginScene — escena 3D del login.
 *
 * Composición:
 *  - `Environment preset="night"` para reflections realistas en los materiales
 *     metálicos del carro.
 *  - `<CarModel>` (`/models/car.glb`) — bob idle + mouse parallax + click=burst.
 *  - Piso `MeshReflectorMaterial` denso (resolution 512, mixStrength 15).
 *  - Líneas estáticas decorativas (cyan, opacity 0.3).
 *  - Luces: ambient 0.15 + point cyan superior + 2 point violetas traseros
 *    + spot frontal blanco (faros simulados).
 *  - Post: Bloom (luminanceThreshold 0.2, intensity 1.8) + Vignette.
 *
 * El postprocessing se apaga cuando `useAdaptiveQuality` reporta tier ≠ "high"
 * o cuando el usuario tiene `prefers-reduced-motion`.
 */
export function LoginScene({ bodyColor, className }: LoginSceneProps) {
  const carRef = useRef<CarModelHandle>(null);
  const reduced = usePrefersReducedMotion();

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <BrandCanvas
        camera={{ position: [4.2, 1.7, 5.5], fov: 38 }}
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
  bodyColor: string | undefined;
  carRef: React.RefObject<CarModelHandle>;
  reduced: boolean;
}) {
  const quality = useAdaptiveQuality();
  const postprocessing = quality.postprocessing && !reduced;

  return (
    <>
      <color attach="background" args={['#04020F']} />
      {/* Fog más permisivo para que se vean las reflexiones del piso */}
      <fog attach="fog" args={['#04020F', 12, 36]} />

      {/* Luces — perfil "noche con neón" */}
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 4, 2]} color="#0AFFE0" intensity={3} distance={10} />
      <pointLight position={[-3, 1, -2]} color="#7000FF" intensity={2} distance={8} />
      <pointLight position={[3, 1, -2]} color="#7000FF" intensity={2} distance={8} />
      {/* Faros simulados: spotLight frontal blanco */}
      <spotLight
        position={[0, 1, 3.5]}
        target-position={[0, 0, 10]}
        color="#FFFFFF"
        intensity={4}
        angle={0.25}
        penumbra={0.4}
        distance={20}
      />

      {/* Carriles decorativos */}
      <StaticLaneLines />

      {/* Carro (lazy chunk del .glb) */}
      <CarModel
        ref={carRef}
        bodyColor={bodyColor}
        bob={!reduced}
        position={[0, 0, 0]}
        onClick={() => carRef.current?.burst()}
      />

      {/* Piso reflectivo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.85, 0]}>
        <planeGeometry args={[20, 20]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={512}
          mixBlur={1}
          mixStrength={15}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#04020F"
          metalness={0.8}
        />
      </mesh>

      <Environment preset="night" />

      {postprocessing ? (
        <EffectComposer multisampling={0}>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            intensity={1.8}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.3} darkness={0.8} />
        </EffectComposer>
      ) : null}
    </>
  );
}

export default LoginScene;
