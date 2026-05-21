import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

const NAV_LINKS = [
  { href: '#features', label: 'Características' },
  { href: '#roles', label: 'Roles' },
  { href: '#pricing', label: 'Precios' },
] as const;

/** Logo "ConduPro" minimalista — ícono volante en azul accent + wordmark. */
export function BrandMark({ size = 24, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2.5 text-text-primary no-underline"
      aria-label="ConduPro"
    >
      <span
        className="grid place-items-center rounded-xl bg-accent text-white"
        style={{ width: size + 12, height: size + 12 }}
      >
        <SteeringIcon style={{ width: size * 0.65, height: size * 0.65 }} />
      </span>
      {withText ? (
        <span className="text-lg font-semibold tracking-tight">ConduPro</span>
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
 * LandingNav — top bar minimalista (estilo Apple).
 *
 * - Fondo `white/80` + `backdrop-blur` siempre (el hero es negro y el contraste
 *   funciona; las secciones posteriores son blancas y la barra se funde).
 * - Borde inferior sutil; sin gradientes, sin glow.
 * - Mobile: drawer fullscreen blanco con Framer Motion.
 */
export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return;
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setOpen(false);
  };

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 transition-colors duration-200',
          scrolled
            ? 'border-b border-border bg-bg-primary/80 backdrop-blur-md'
            : 'border-b border-transparent bg-bg-primary/60 backdrop-blur-md',
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
                className="text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              to={ROUTES.LOGIN}
              className="rounded-full px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:text-text-primary"
            >
              Iniciar sesión
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-accent-hover"
            >
              Empezar gratis
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-xl border border-border bg-bg-primary text-text-primary md:hidden"
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
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="fixed inset-0 z-40 flex flex-col bg-bg-primary px-6 pt-24 md:hidden"
          >
            <nav className="flex flex-col gap-5">
              {NAV_LINKS.map((l, idx) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => handleAnchor(e, l.href)}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: { delay: 0.05 + idx * 0.04, duration: 0.25 },
                  }}
                  className="text-2xl font-semibold text-text-primary"
                >
                  {l.label}
                </motion.a>
              ))}
            </nav>
            <div className="mt-10 flex flex-col gap-3">
              <Link
                to={ROUTES.LOGIN}
                onClick={() => setOpen(false)}
                className="rounded-full border border-border px-5 py-3 text-center text-sm font-medium text-text-primary"
              >
                Iniciar sesión
              </Link>
              <Link
                to={ROUTES.REGISTER}
                onClick={() => setOpen(false)}
                className="rounded-full bg-accent px-5 py-3 text-center text-sm font-medium text-white"
              >
                Empezar gratis
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default LandingNav;
