import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

/**
 * CtaFinalSection — banda de cierre oscura tipo Apple ("come and see").
 * Fondo near-black (#1D1D1F), texto blanco, CTA blanco con texto oscuro.
 */
export function CtaFinalSection() {
  return (
    <section id="pricing" className="bg-[#1D1D1F] py-24 sm:py-32 text-white">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          ¿Listo para transformar tu escuela?
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70">
          Activa ConduPro hoy y empieza con un plan gratis. Sin tarjeta, sin compromiso.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-3">
          <Link
            to={ROUTES.REGISTER}
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-text-primary transition-colors duration-150 hover:bg-bg-secondary"
          >
            Empezar gratis
            <ArrowRight className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#pricing"
            className="inline-flex h-11 items-center rounded-full border border-white/20 px-6 text-sm font-medium text-white transition-colors duration-150 hover:border-white/40"
          >
            Ver planes
          </a>
        </div>
      </div>
    </section>
  );
}

export default CtaFinalSection;
