import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  CalendarPlus,
  CalendarClock,
  CalendarRange,
  Car,
  ChevronsLeft,
  ChevronsRight,
  Gauge,
  BookOpen,
  LineChart,
  LogOut,
  Menu,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { Avatar } from '@/components/ui/Avatar';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

interface NavItem {
  label: string;
  to: string;
  icon: typeof Gauge;
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  [ROLES.STUDENT]: [
    { label: 'Dashboard', to: ROUTES.STUDENT.DASHBOARD, icon: Gauge },
    { label: 'Mis clases', to: ROUTES.STUDENT.SCHEDULES, icon: CalendarClock },
    { label: 'Agendar clase', to: ROUTES.STUDENT.BOOK, icon: CalendarPlus },
  ],
  [ROLES.INSTRUCTOR]: [
    { label: 'Dashboard', to: ROUTES.INSTRUCTOR.DASHBOARD, icon: Gauge },
    { label: 'Mis clases', to: ROUTES.INSTRUCTOR.SCHEDULES, icon: CalendarClock },
    { label: 'Mi disponibilidad', to: ROUTES.INSTRUCTOR.AVAILABILITY, icon: CalendarRange },
  ],
  [ROLES.ADMIN]: [
    { label: 'Dashboard', to: ROUTES.ADMIN.DASHBOARD, icon: Gauge },
    { label: 'Usuarios', to: ROUTES.ADMIN.USERS, icon: Users },
    { label: 'Agendamientos', to: ROUTES.ADMIN.SCHEDULES, icon: CalendarClock },
    { label: 'Vehículos', to: ROUTES.ADMIN.VEHICLES, icon: Car },
    { label: 'Cursos', to: ROUTES.ADMIN.COURSES, icon: BookOpen },
    { label: 'Reportes', to: ROUTES.ADMIN.REPORTS, icon: LineChart },
  ],
};

export function AppShell() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const items = user ? NAV_BY_ROLE[user.role] ?? [] : [];
  const userFullName = user ? `${user.firstName} ${user.lastName}` : 'Usuario';

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-surface-950">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-body-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>
      <Sidebar
        collapsed={collapsed}
        onCollapseToggle={() => setCollapsed((c) => !c)}
        items={items}
        userName={userFullName}
        userEmail={user?.email ?? ''}
        onLogout={() => void logout()}
        currentPath={location.pathname}
      />

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Sidebar
          collapsed={false}
          mobile
          onCollapseToggle={() => setMobileOpen(false)}
          items={items}
          userName={userFullName}
          userEmail={user?.email ?? ''}
          onLogout={() => void logout()}
          currentPath={location.pathname}
          onNavClick={() => setMobileOpen(false)}
        />
      </MobileDrawer>

      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-200 ease-smooth',
          collapsed ? 'lg:pl-[72px]' : 'lg:pl-64',
        )}
      >
        <MobileNavbar onOpenMenu={() => setMobileOpen(true)} userName={userFullName} />
        <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 outline-none">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  collapsed,
  onCollapseToggle,
  items,
  userName,
  userEmail,
  onLogout,
  currentPath,
  mobile = false,
  onNavClick,
}: {
  collapsed: boolean;
  onCollapseToggle: () => void;
  items: NavItem[];
  userName: string;
  userEmail: string;
  onLogout: () => void;
  currentPath: string;
  mobile?: boolean;
  onNavClick?: () => void;
}) {
  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-surface-200 bg-surface-50 dark:border-surface-800 dark:bg-surface-900',
        mobile
          ? 'w-72'
          : cn(
              'fixed inset-y-0 left-0 z-40 hidden lg:flex transition-[width] duration-200 ease-smooth',
              collapsed ? 'w-[72px]' : 'w-64',
            ),
      )}
    >
      <div
        className={cn(
          'flex h-16 items-center border-b border-surface-200 px-4 dark:border-surface-800',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        <Logo withText={!collapsed} size={28} />
        {!mobile ? (
          <button
            type="button"
            onClick={onCollapseToggle}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-md text-surface-500 hover:bg-surface-200 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-200',
              collapsed && 'hidden',
            )}
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {!mobile && collapsed ? (
        <button
          type="button"
          onClick={onCollapseToggle}
          aria-label="Expandir menú"
          className="mx-auto my-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-surface-500 hover:bg-surface-200 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-200"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      ) : null}

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navegación principal">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.to || currentPath.startsWith(`${item.to}/`);
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  onClick={onNavClick}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm font-medium transition-colors duration-150',
                    active
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200'
                      : 'text-surface-600 hover:bg-surface-100 hover:text-surface-800 dark:text-surface-300 dark:hover:bg-surface-800 dark:hover:text-surface-100',
                    collapsed && 'justify-center px-2',
                  )}
                >
                  {active ? (
                    <span
                      aria-hidden
                      className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-primary-600"
                    />
                  ) : null}
                  <Icon className={cn('h-4 w-4 shrink-0', active && 'text-primary-600 dark:text-primary-300')} />
                  {!collapsed ? <span className="truncate">{item.label}</span> : null}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-surface-200 p-3 dark:border-surface-800">
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg p-2',
            collapsed ? 'flex-col justify-center' : 'bg-surface-100/60 dark:bg-surface-800/60',
          )}
        >
          <Avatar name={userName} size="sm" />
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-sm font-semibold text-surface-800 dark:text-surface-100">
                {userName}
              </p>
              <p className="truncate text-caption text-surface-500 dark:text-surface-400">{userEmail}</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={onLogout}
            aria-label="Cerrar sesión"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-surface-500 transition-colors hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/20 dark:hover:text-error-500"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        {!collapsed ? (
          <div className="mt-3 flex items-center justify-between px-2">
            <span className="text-caption text-surface-500 dark:text-surface-400">Tema</span>
            <ThemeToggle />
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function MobileDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <div
        className="absolute inset-0 bg-surface-950/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative z-10 animate-slide-down outline-none"
      >
        <span id={titleId} className="sr-only">
          Menú de navegación
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-md text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-800"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

function MobileNavbar({ onOpenMenu, userName }: { onOpenMenu: () => void; userName: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-surface-200 bg-surface-50/80 px-4 backdrop-blur-md dark:border-surface-800 dark:bg-surface-900/80 lg:hidden">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menú"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-surface-600 hover:bg-surface-200 dark:text-surface-300 dark:hover:bg-surface-800"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Logo size={24} />
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Avatar name={userName} size="sm" />
      </div>
    </header>
  );
}
