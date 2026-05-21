import { Link } from 'react-router-dom';
import { BrandMark } from './LandingNav';
import { ROUTES } from '@/constants/routes';

const COLUMNS = [
  {
    title: 'Producto',
    links: [
      { label: 'Características', href: '#features' },
      { label: 'Roles', href: '#roles' },
      { label: 'Precios', href: '#pricing' },
      { label: 'Cambios', href: '#' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre nosotros', href: '#' },
      { label: 'Contacto', href: '#' },
      { label: 'Soporte', href: '#' },
      { label: 'Estado', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Términos', href: '#' },
      { label: 'Privacidad', href: '#' },
      { label: 'Seguridad', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  },
] as const;

/**
 * LandingFooter — cierre con 4 columnas (logo + descripción, producto,
 * empresa, legal) y una línea de gradiente animada en el borde superior.
 */
export function LandingFooter() {
  return (
    <footer className="relative bg-brand-dark pb-12 pt-20">
      {/* Línea de gradiente animada */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px overflow-hidden"
      >
        <div
          className="h-full animate-gradient-shift"
          style={{
            background:
              'linear-gradient(90deg, #0AFFE0 0%, #7000FF 25%, #0AFFE0 50%, #7000FF 75%, #0AFFE0 100%)',
            backgroundSize: '200% 100%',
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          <div className="col-span-2 max-w-xs lg:col-span-1">
            <BrandMark />
            <p className="mt-5 text-sm leading-relaxed text-brand-light/60">
              La plataforma todo-en-uno para escuelas de conducción modernas.
              Diseñada en Colombia, lista para el mundo.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="font-mono-brand text-[10px] uppercase tracking-[0.3em] text-brand-light/50">
                {col.title}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-brand-light/80 transition-colors hover:text-brand-primary"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-brand-mid/40 pt-6 sm:flex-row sm:items-center">
          <p className="font-mono-brand text-[11px] uppercase tracking-[0.3em] text-brand-light/50">
            © {new Date().getFullYear()} ConduPro · Built in Colombia
          </p>
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.LOGIN}
              className="text-xs text-brand-light/70 transition-colors hover:text-brand-light"
            >
              Iniciar sesión
            </Link>
            <span className="text-brand-light/30">·</span>
            <Link
              to={ROUTES.REGISTER}
              className="text-xs text-brand-primary transition-colors hover:text-brand-light"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
