import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useSmoothScroll } from '@/providers/SmoothScrollProvider';
import { ROUTES } from '@/constants/routes';

const NAV_LINKS = [
  { href: '#features', label: 'Características' },
  { href: '#roles', label: 'Roles' },
  { href: '#pricing', label: 'Precios' },
] as const;

/**
 * Logo "Condu**Pro**" con ícono SVG de volante.
 * Reutilizable en navbar y footer.
 */
export function BrandMark({ size = 28, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <Link
      to="/"
      className="group inline-flex items-center gap-2.5 text-brand-light no-underline"
      aria-label="ConduPro"
    >
      <span
        className="grid place-items-center rounded-xl bg-gradient-dynamic transition-transform duration-300 ease-brand group-hover:rotate-[15deg]"
        style={{ width: size + 12, height: size + 12 }}
      >
        <SteeringIcon className="text-brand-dark" style={{ width: size * 0.6, height: size * 0.6 }} />
      </span>
      {withText ? (
        <span className="font-hero text-xl font-bold tracking-tight">
          Condu<span className="text-gradient-dynamic">Pro</span>
        </span>
      ) : null}
    </Link>
  );
}

function SteeringIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 5v4.6" />
      <path d="M5.6 14.5l4 -2.1" />
      <path d="M18.4 14.5l-4 -2.1" />
    </svg>
  );
}

/**
 * LandingNav — navbar fija en top.
 *
 * - Transparente al cargar.
 * - Cambia a glassmorphism (`backdrop-blur` + fondo oscuro semi-translúcido)
 *   cuando `scrollY > 50`.
 * - Anchor links se desplazan suavemente con Lenis (via `useSmoothScroll`).
 * - Mobile: botón hamburger abre un drawer fullscreen animado con
 *   Framer Motion.
 */
export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Bloquear el scroll cuando el drawer mobile está abierto.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return;
    e.preventDefault();
    scrollTo(href, { offset: -80 });
    setOpen(false);
  };

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-brand',
          scrolled
            ? 'border-b border-brand-mid/40 bg-brand-dark/65 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent backdrop-blur-0',
        ].join(' ')}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <BrandMark />

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => handleAnchor(e, l.href)}
                className="group relative text-sm font-medium text-brand-light/75 transition-colors duration-300 ease-brand hover:text-brand-light"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-dynamic transition-all duration-300 ease-brand group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to={ROUTES.LOGIN}
              className="rounded-full border border-brand-mid/70 bg-brand-surface/30 px-4 py-2 text-sm font-medium text-brand-light/85 transition-all duration-300 ease-brand hover:border-brand-primary/40 hover:text-brand-light"
            >
              Iniciar sesión
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="rounded-full bg-gradient-dynamic px-4 py-2 font-mono-brand text-xs font-semibold uppercase tracking-[0.18em] text-brand-dark transition-transform duration-300 ease-brand hover:translate-y-[-1px] hover:shadow-[0_12px_28px_-12px_rgba(10,255,224,0.55)]"
            >
              Empieza gratis
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-xl border border-brand-mid/60 bg-brand-surface/40 text-brand-light md:hidden"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="mobile-drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-40 flex flex-col bg-brand-dark/95 px-6 pt-24 backdrop-blur-2xl md:hidden"
          >
            <nav className="flex flex-col gap-6">
              {NAV_LINKS.map((l, idx) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => handleAnchor(e, l.href)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: { delay: 0.05 + idx * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                  }}
                  className="font-hero text-3xl font-bold text-brand-light"
                >
                  {l.label}
                </motion.a>
              ))}
            </nav>
            <div className="mt-12 flex flex-col gap-3">
              <Link
                to={ROUTES.LOGIN}
                onClick={() => setOpen(false)}
                className="rounded-full border border-brand-mid/70 px-5 py-3 text-center font-medium text-brand-light"
              >
                Iniciar sesión
              </Link>
              <Link
                to={ROUTES.REGISTER}
                onClick={() => setOpen(false)}
                className="rounded-full bg-gradient-dynamic px-5 py-3 text-center font-mono-brand text-xs font-semibold uppercase tracking-[0.2em] text-brand-dark"
              >
                Empieza gratis
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default LandingNav;
