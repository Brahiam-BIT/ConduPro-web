import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Environment, MeshReflectorMaterial, OrbitControls } from '@react-three/drei';
import BrandCanvas from '@/components/three/BrandCanvas';
import ParticlesField from '@/components/three/ParticlesField';
import { RoadMesh } from '@/components/three/RoadShader';
import { useAdaptiveQuality, type QualityTier } from '@/hooks/useAdaptiveQuality';
import type { CarModelHandle } from '@/components/three/CarModel';

const CarModel = lazy(() => import('@/components/three/CarModel'));

function SceneFallback({ label }: { label: string }) {
  return (
    <div className="grid h-full w-full place-items-center bg-gradient-dynamic-soft text-brand-light/70">
      <span className="font-mono-brand text-xs uppercase tracking-[0.3em]">
        Cargando {label}…
      </span>
    </div>
  );
}

/** Componente in-canvas: mide FPS y emite un evento custom para el HUD. */
function QualityProbe() {
  const { tier, fps } = useAdaptiveQuality();
  const lastRef = useRef<string>('');
  useEffect(() => {
    const key = `${tier}-${fps}`;
    if (lastRef.current === key) return;
    lastRef.current = key;
    window.dispatchEvent(new CustomEvent('brand-quality', { detail: { tier, fps } }));
  }, [tier, fps]);
  return null;
}

export default function ThreeTestPage() {
  const carRef = useRef<CarModelHandle>(null);
  const [quality, setQuality] = useState<{ tier: QualityTier; fps: number }>({
    tier: 'high',
    fps: 60,
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { tier: QualityTier; fps: number };
      setQuality(detail);
    };
    window.addEventListener('brand-quality', handler);
    return () => window.removeEventListener('brand-quality', handler);
  }, []);

  return (
    <div className="theme-dynamic min-h-screen bg-brand-dark px-6 py-10 text-brand-light">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-3">
          <p className="font-mono-brand text-xs uppercase tracking-[0.4em] text-brand-primary">
            /dev/three-test
          </p>
          <h1 className="font-hero text-4xl font-bold leading-tight">
            Sandbox 3D — <span className="text-gradient-dynamic">Fase A</span>
          </h1>
          <p className="max-w-2xl text-sm text-brand-light/70">
            Smoke test de los building blocks de la actualización visual.
            Esta página sólo se monta en development.
          </p>
          <div className="inline-flex items-center gap-3 rounded-full border border-brand-primary/30 bg-brand-surface/60 px-4 py-1.5 font-mono-brand text-xs uppercase tracking-widest text-brand-light/80">
            <span className="size-2 rounded-full bg-brand-primary shadow-[0_0_8px_#0AFFE0]" />
            calidad: {quality.tier} · {quality.fps} fps
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="font-hero text-2xl">1 · ParticlesField</h2>
          <div className="h-72 overflow-hidden rounded-3xl border border-brand-mid bg-brand-surface">
            <Suspense fallback={<SceneFallback label="partículas" />}>
              <BrandCanvas camera={{ position: [0, 0, 8] }}>
                <color attach="background" args={['#04020F']} />
                <ambientLight intensity={0.6} />
                <ParticlesField count={1800} dual radius={9} size={0.04} />
                <QualityProbe />
              </BrandCanvas>
            </Suspense>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-hero text-2xl">2 · RoadShader</h2>
          <div className="h-96 overflow-hidden rounded-3xl border border-brand-mid bg-brand-surface">
            <Suspense fallback={<SceneFallback label="carretera" />}>
              <BrandCanvas camera={{ position: [0, 2.2, 6.5], fov: 55 }}>
                <color attach="background" args={['#04020F']} />
                <fog attach="fog" args={['#04020F', 12, 55]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[0, 6, 6]} intensity={20} color="#7000FF" distance={20} />
                <RoadMesh size={[22, 80]} position={[0, 0, -20]} speed={0.8} lanes={6} />
                <ParticlesField count={400} radius={20} size={0.05} dual />
              </BrandCanvas>
            </Suspense>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-hero text-2xl">3 · CarModel</h2>
            <button
              type="button"
              onClick={() => carRef.current?.burst()}
              className="rounded-full bg-gradient-dynamic px-5 py-2 font-mono-brand text-xs uppercase tracking-widest text-brand-dark transition-transform duration-300 ease-brand hover:scale-[1.03]"
            >
              Arrancar carro
            </button>
          </div>
          <div className="h-[28rem] overflow-hidden rounded-3xl border border-brand-mid bg-brand-surface">
            <Suspense fallback={<SceneFallback label="carro" />}>
              <BrandCanvas camera={{ position: [4, 2.4, 6], fov: 45 }}>
                <color attach="background" args={['#04020F']} />
                <fog attach="fog" args={['#04020F', 10, 30]} />
                <ambientLight intensity={0.35} />
                <pointLight position={[0, 6, 3]} intensity={28} color="#7000FF" distance={18} />
                <pointLight position={[0, 2, 8]} intensity={12} color="#0AFFE0" distance={12} />
                <Suspense fallback={null}>
                  <CarModel ref={carRef} onClick={() => carRef.current?.burst()} />
                </Suspense>
                <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
                  <planeGeometry args={[40, 40]} />
                  <MeshReflectorMaterial
                    mirror={0.45}
                    blur={[400, 100]}
                    resolution={1024}
                    mixBlur={1}
                    mixStrength={1.2}
                    roughness={0.85}
                    depthScale={0.6}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#0A0717"
                    metalness={0.55}
                  />
                </mesh>
                <Environment preset="city" />
                <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.05} />
              </BrandCanvas>
            </Suspense>
          </div>
          <p className="font-mono-brand text-xs text-brand-light/50">
            Arrastra para orbitar · Click en el botón (o en el carro) para arrancarlo
          </p>
        </section>
      </div>
    </div>
  );
}
