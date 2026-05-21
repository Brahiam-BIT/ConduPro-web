import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import BrandCanvas from '@/components/three/BrandCanvas';
import { ROUTES } from '@/constants/routes';

const ParticlesField = lazy(() =>
  import('@/components/three/ParticlesField').then((m) => ({ default: m.ParticlesField })),
);

/**
 * CtaFinalSection — banda de cierre con CTA, ParticlesField sutil de fondo
 * y dos botones (Empieza gratis / Ver planes).
 */
export function CtaFinalSection() {
  return (
    <section id="pricing" className="relative isolate overflow-hidden bg-brand-dark py-32 sm:py-40">
      {/* Canvas de partículas sutiles */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <Suspense fallback={null}>
          <BrandCanvas camera={{ position: [0, 0, 6], fov: 60 }} background="#04020F">
            <ambientLight intensity={0.6} />
            <ParticlesField count={900} radius={12} size={0.04} dual opacity={0.7} />
          </BrandCanvas>
        </Suspense>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-[5]"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(112,0,255,0.32) 0%, rgba(10,255,224,0.05) 40%, rgba(4,2,15,0) 70%)',
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <p className="font-mono-brand text-xs uppercase tracking-[0.4em] text-brand-primary">
          ✦ Empieza hoy
        </p>
        <h2 className="mt-4 font-hero text-4xl font-bold leading-[1.05] text-brand-light sm:text-5xl md:text-6xl">
          ¿Listo para <span className="text-gradient-dynamic">transformar</span> tu escuela?
        </h2>
        <p className="mt-5 max-w-xl text-base text-brand-light/70">
          Activa ConduPro hoy y empieza con un plan gratis. Sin tarjeta, sin compromiso.
        </p>
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <Link
            to={ROUTES.REGISTER}
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-gradient-dynamic px-7 font-mono-brand text-xs font-semibold uppercase tracking-[0.22em] text-brand-dark transition-all duration-300 ease-brand hover:translate-y-[-2px] hover:shadow-[0_18px_44px_-12px_rgba(10,255,224,0.55)]"
          >
            Empieza gratis
            <ArrowRight className="size-4 transition-transform duration-300 ease-brand group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#pricing"
            className="inline-flex h-12 items-center rounded-full border border-brand-mid/70 bg-brand-surface/30 px-6 text-sm font-medium text-brand-light/85 transition-all duration-300 ease-brand hover:border-brand-primary/40 hover:text-brand-light"
          >
            Ver planes
          </a>
        </div>
      </div>
    </section>
  );
}

export default CtaFinalSection;
