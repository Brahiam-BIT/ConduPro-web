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

/** LandingFooter — 4 columnas minimalistas sobre gris claro. */
export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-bg-secondary pb-10 pt-16">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          <div className="col-span-2 max-w-xs lg:col-span-1">
            <BrandMark />
            <p className="mt-5 text-sm leading-relaxed text-text-secondary">
              La plataforma todo-en-uno para escuelas de conducción modernas.
              Diseñada en Colombia, lista para el mundo.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-text-primary">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-text-tertiary">
            © {new Date().getFullYear()} ConduPro · Built in Colombia
          </p>
          <div className="flex items-center gap-3 text-xs">
            <Link
              to={ROUTES.LOGIN}
              className="text-text-secondary transition-colors duration-150 hover:text-text-primary"
            >
              Iniciar sesión
            </Link>
            <span className="text-text-tertiary">·</span>
            <Link
              to={ROUTES.REGISTER}
              className="font-medium text-accent transition-colors duration-150 hover:text-accent-hover"
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
