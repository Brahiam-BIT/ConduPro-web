import { useEffect, useRef } from 'react';
import { Environment, MeshReflectorMaterial } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import BrandCanvas from './BrandCanvas';
import CarModel, { type CarModelHandle } from './CarModel';
export interface HeroSceneState {
  progress: number;
  isMobile: boolean;
}

const lerp = THREE.MathUtils.lerp;

function sub(p: number, from: number, to: number) {
  return THREE.MathUtils.clamp((p - from) / (to - from), 0, 1);
}

function ToneMappingSetup() {
  const { gl } = useThree();
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  }, [gl]);
  return null;
}

/** Piso oscuro reflectante — define silueta del carro y separa del fondo negro. */
function HeroFloor() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -1.05, 0]}>
      <planeGeometry args={[24, 24]} />
      <MeshReflectorMaterial
        blur={[300, 80]}
        resolution={512}
        mixBlur={0.8}
        mixStrength={2.5}
        roughness={0.92}
        depthScale={0.6}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.2}
        color="#0c0c0e"
        metalness={0.35}
        mirror={0.15}
      />
    </mesh>
  );
}

function CarChoreography({ stateRef }: { stateRef: React.MutableRefObject<HeroSceneState> }) {
  const carRef = useRef<CarModelHandle>(null);
  const keyRef = useRef<THREE.PointLight>(null);
  const { camera } = useThree();
  const opacityRef = useRef(1);
  const targetPos = useRef(new THREE.Vector3(0, -0.5, 0));
  const didResetOpacity = useRef(false);

  const resetCarOpacity = (group: THREE.Group) => {
    opacityRef.current = 1;
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => {
          if (!(m instanceof THREE.MeshStandardMaterial)) return;
          m.opacity = 1;
          m.transparent = false;
          m.depthWrite = true;
        });
      }
    });
  };

  useFrame(() => {
    const { progress, isMobile } = stateRef.current;
    const group = carRef.current?.group;
    if (!group) return;

    if (!didResetOpacity.current) {
      didResetOpacity.current = true;
      resetCarOpacity(group);
    }

    const key = keyRef.current;
    if (key) {
      key.position.set(group.position.x + 2.5, 2.8, group.position.z + 3.5);
    }

    if (isMobile) {
      const t = performance.now() / 1000;
      group.rotation.y = THREE.MathUtils.degToRad(-18) + Math.sin(t * 0.4) * 0.04;
      group.scale.setScalar(1.15);
      group.position.set(0, -0.5, 0);
      camera.position.set(0, 0.25, 5.2);
      camera.lookAt(0, -0.15, 0);
      return;
    }

    const a = sub(progress, 0, 0.3);
    const b = sub(progress, 0.3, 0.7);
    const c = sub(progress, 0.7, 1.0);

    const rotY =
      lerp(THREE.MathUtils.degToRad(-18), 0, a) +
      lerp(0, THREE.MathUtils.degToRad(22), b);
    const scale = lerp(1.0, 1.5, a) - lerp(0, 0.2, b);
    const posX = lerp(0, 2.4, b);
    const posY = lerp(-0.5, -0.5 - 0.8, c);
    const camZ = lerp(5.2, 4.0, a);
    const opacity = lerp(1, 0, c);

    group.rotation.y = rotY;
    group.scale.setScalar(scale);
    targetPos.current.set(posX, posY, 0);
    group.position.lerp(targetPos.current, 0.18);

    camera.position.set(0, 0.3, camZ);
    camera.lookAt(group.position.x * 0.3, -0.1, 0);

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

  return (
    <>
      <pointLight ref={keyRef} intensity={1.8} color="#f5f8ff" distance={14} decay={2} />
      <CarModel
        ref={carRef}
        bodyColor="#35353A"
        targetSize={2.85}
        position={[0, -0.5, 0]}
        idle={false}
        variant="hero"
      />
    </>
  );
}

export interface HeroSceneProps {
  stateRef: React.MutableRefObject<HeroSceneState>;
  className?: string;
}

export function HeroScene({ stateRef, className }: HeroSceneProps) {
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <BrandCanvas
        camera={{ position: [0, 0.3, 5.2], fov: 32, near: 0.1, far: 50 }}
        background="#000000"
        gl={{ antialias: true, alpha: false }}
      >
        <ToneMappingSetup />
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 12, 28]} />

        <ambientLight intensity={0.4} color="#b8bcc8" />
        <directionalLight position={[-5, 8, 5]} intensity={1.1} color="#ffffff" />
        <directionalLight position={[6, 3, -3]} intensity={0.55} color="#7eb8ff" />
        <directionalLight position={[0, 1, 8]} intensity={0.45} color="#e8e8ed" />
        <pointLight position={[-2, 2, 3]} intensity={0.6} color="#ffffff" distance={12} />

        <Environment preset="studio" environmentIntensity={0.75} />

        <HeroFloor />
        <CarChoreography stateRef={stateRef} />
      </BrandCanvas>
    </div>
  );
}

export default HeroScene;
