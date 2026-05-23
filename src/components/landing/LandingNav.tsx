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
export function BrandMark({
  size = 24,
  withText = true,
  light = false,
}: {
  size?: number;
  withText?: boolean;
  /** Wordmark claro para nav sobre fondo oscuro (hero). */
  light?: boolean;
}) {
  return (
    <Link
      to="/"
      className={[
        'inline-flex items-center gap-2.5 no-underline',
        light ? 'text-white' : 'text-text-primary',
      ].join(' ')}
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
 * - Sobre el hero negro: vidrio oscuro + texto claro.
 * - Tras el hero (secciones blancas): vidrio claro + texto oscuro.
 * - Mobile: drawer fullscreen blanco con Framer Motion.
 */
export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('hero');

    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      if (hero) {
        const heroEnd = hero.offsetTop + hero.offsetHeight;
        setOverHero(window.scrollY < heroEnd - 72);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
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

  const onDarkHero = overHero;

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300',
          onDarkHero
            ? scrolled
              ? 'border-b border-white/10 bg-black/55 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] backdrop-blur-xl'
              : 'border-b border-white/[0.07] bg-black/25 backdrop-blur-xl'
            : scrolled
              ? 'border-b border-border bg-bg-primary/90 shadow-sm backdrop-blur-md'
              : 'border-b border-transparent bg-bg-primary/75 backdrop-blur-md',
        ].join(' ')}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <BrandMark light={onDarkHero} />

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => handleAnchor(e, l.href)}
                className={[
                  'text-sm font-medium transition-colors duration-150',
                  onDarkHero
                    ? 'text-white/70 hover:text-white'
                    : 'text-text-secondary hover:text-text-primary',
                ].join(' ')}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              to={ROUTES.LOGIN}
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150',
                onDarkHero
                  ? 'text-white/75 hover:text-white'
                  : 'text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              Iniciar sesión
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white shadow-[0_2px_12px_rgba(0,113,227,0.35)] transition-colors duration-150 hover:bg-accent-hover"
            >
              Empezar gratis
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={[
              'grid size-10 place-items-center rounded-xl border transition-colors duration-150 md:hidden',
              onDarkHero
                ? 'border-white/15 bg-white/10 text-white hover:bg-white/15'
                : 'border-border bg-bg-primary text-text-primary',
            ].join(' ')}
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
