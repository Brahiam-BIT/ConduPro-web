import { ROUTES } from '@/constants/routes';

export interface PageMeta {
  title: string;
  subtitle: string;
}

/** Títulos y descripciones por ruta (admin, instructor, estudiante). */
export const PAGE_META: Record<string, PageMeta> = {
  [ROUTES.STUDENT.DASHBOARD]: {
    title: 'Mi dashboard',
    subtitle: 'Resumen de tu progreso, licencia activa y próximas clases',
  },
  [ROUTES.STUDENT.SCHEDULES]: {
    title: 'Mis clases',
    subtitle: 'Consulta y gestiona todas tus clases agendadas',
  },
  [ROUTES.STUDENT.LICENSES]: {
    title: 'Mis licencias',
    subtitle: 'Progreso hacia cada categoría: temario teórico y clases prácticas',
  },
  [ROUTES.STUDENT.BOOK]: {
    title: 'Agendar clase',
    subtitle: 'Selecciona el tipo de clase y el horario que prefieras',
  },
  [ROUTES.INSTRUCTOR.DASHBOARD]: {
    title: 'Dashboard',
    subtitle: 'Resumen de tus clases impartidas esta semana',
  },
  [ROUTES.INSTRUCTOR.SCHEDULES]: {
    title: 'Mis clases',
    subtitle: 'Gestiona las clases que impartes',
  },
  [ROUTES.INSTRUCTOR.AVAILABILITY]: {
    title: 'Mi disponibilidad',
    subtitle: 'Marca los horarios en los que puedes impartir clases',
  },
  [ROUTES.ADMIN.DASHBOARD]: {
    title: 'Panel de administración',
    subtitle: 'Vista general de la escuela',
  },
  [ROUTES.ADMIN.USERS]: {
    title: 'Usuarios',
    subtitle: 'Gestiona estudiantes, instructores y administradores',
  },
  [ROUTES.ADMIN.SCHEDULES]: {
    title: 'Agendamientos',
    subtitle: 'Listado y gestión de todas las clases',
  },
  [ROUTES.ADMIN.VEHICLES]: {
    title: 'Vehículos',
    subtitle: 'Inventario de la flota',
  },
  [ROUTES.ADMIN.COURSES]: {
    title: 'Cursos y licencias',
    subtitle: 'Categorías de conducción y temario teórico por licencia',
  },
  [ROUTES.ADMIN.REPORTS]: {
    title: 'Reportes',
    subtitle: 'Métricas, gráficas y exportación',
  },
};

export function getPageMeta(pathname: string): PageMeta | null {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  const match = Object.keys(PAGE_META).find(
    (route) => pathname.startsWith(route) && route !== '/',
  );
  return match ? (PAGE_META[match] ?? null) : null;
}
