import { ROUTES } from '@/constants/routes';

export interface GuidedTourStep {
  title: string;
  content: string;
}

export interface GuidedTourDefinition {
  route: string;
  steps: GuidedTourStep[];
}

export const GUIDED_TOURS: GuidedTourDefinition[] = [
  {
    route: ROUTES.STUDENT.DASHBOARD,
    steps: [
      {
        title: 'Bienvenido a tu espacio',
        content:
          'Aquí ves un resumen de tu actividad: clases de hoy, horas acumuladas y el avance hacia tu licencia activa.',
      },
      {
        title: 'Progreso de licencia',
        content:
          'Si estás matriculado, aparece una tarjeta con tu avance en teoría y práctica. Desde ahí puedes ir a Mis licencias.',
      },
      {
        title: 'Próximas clases',
        content:
          'Revisa tu siguiente clase y el historial reciente. Usa el menú lateral para agendar o ver el detalle completo.',
      },
    ],
  },
  {
    route: ROUTES.STUDENT.SCHEDULES,
    steps: [
      {
        title: 'Listado de clases',
        content:
          'Todas tus clases aparecen en la tabla. Haz clic en una fila para ver el detalle, cancelar si aún está permitido, o filtrar por estado y fechas.',
      },
      {
        title: 'Filtros',
        content:
          'Usa los filtros de estado, tipo y rango de fechas para encontrar clases pasadas o futuras rápidamente.',
      },
    ],
  },
  {
    route: ROUTES.STUDENT.LICENSES,
    steps: [
      {
        title: 'Tus matrículas',
        content:
          'Cada licencia en curso muestra el progreso en temas teóricos y clases prácticas completadas.',
      },
      {
        title: 'Matricularse',
        content:
          'Al final puedes inscribirte en otra categoría (A1, B1, etc.) si aún no tienes matrícula activa en ella.',
      },
      {
        title: 'Agendar práctica',
        content:
          'Con matrícula activa, ve a Agendar clase para reservar prácticas que cuenten hacia tu licencia.',
      },
    ],
  },
  {
    route: ROUTES.STUDENT.MATERIALS,
    steps: [
      {
        title: 'Material de tus clases',
        content:
          'Aquí aparecen los documentos que subió tu instructor, agrupados por licencia y tema teórico.',
      },
      {
        title: 'Descargar',
        content:
          'Solo ves material de licencias en las que estás matriculado (activa o completada). Pulsa Descargar en cada archivo.',
      },
    ],
  },
  {
    route: ROUTES.STUDENT.BOOK,
    steps: [
      {
        title: 'Todo empieza aquí',
        content:
          'Elige teórica o práctica. Teórica: sesiones con cupo por tema. Práctica: fecha y asignación automática.',
      },
      {
        title: 'Paso 2',
        content: 'Según el tipo, continúas al horario correspondiente. Puedes volver para cambiar el tipo.',
      },
    ],
  },
  {
    route: ROUTES.STUDENT.BOOK_THEORY,
    steps: [
      {
        title: 'Clases según tu licencia',
        content: 'Solo ves temas pendientes de tus matrículas activas.',
      },
      {
        title: 'Cupos e inscripción',
        content:
          'Horarios agrupados por día. Elige la hora y pulsa Inscribir (ej. 0/6 cupos).',
      },
    ],
  },
  {
    route: ROUTES.STUDENT.BOOK_PRACTICE,
    steps: [
      {
        title: 'Matrícula activa',
        content: 'Las prácticas requieren matrícula activa en la licencia.',
      },
      {
        title: 'Asignación automática',
        content: 'Elige la fecha; el sistema asigna instructor, vehículo y horario.',
      },
    ],
  },
  {
    route: ROUTES.INSTRUCTOR.DASHBOARD,
    steps: [
      {
        title: 'Tu semana de un vistazo',
        content:
          'Consulta clases de hoy, totales de la semana y del mes, y horas impartidas.',
      },
      {
        title: 'Calendario interactivo',
        content:
          'Haz clic en una celda del calendario para ver el detalle. En teoría verás la materia; en práctica, al estudiante. Puedes abrir su contacto desde el detalle.',
      },
    ],
  },
  {
    route: ROUTES.INSTRUCTOR.SCHEDULES,
    steps: [
      {
        title: 'Gestión de clases',
        content:
          'Lista todas las clases asignadas a ti. Abre el detalle con un clic en la fila.',
      },
      {
        title: 'Acciones en la tabla',
        content:
          'Usa los botones Completar o Cancelar en la columna Acciones. El detalle de la clase solo se abre al hacer clic en la fila.',
      },
    ],
  },
  {
    route: ROUTES.INSTRUCTOR.AVAILABILITY,
    steps: [
      {
        title: 'Semana con fechas',
        content:
          'Arriba de la grilla ves el rango de fechas (ej. 20 – 24 may). Cambia de semana para ver qué días ya tienen clase agendada.',
      },
      {
        title: 'Modo práctica o teoría',
        content:
          'Elige qué marcas. En teoría seleccionas la materia una vez; las columnas muestran el día concreto (lun 20, mar 21…).',
      },
      {
        title: 'Atajos',
        content:
          'Clic en el encabezado del día o en la hora rellena en bloque. «Copiar a lun–vie» repite la franja en toda la semana laboral.',
      },
      {
        title: 'Guardar',
        content: 'Pulsa Guardar cuando termines.',
      },
    ],
  },
  {
    route: ROUTES.INSTRUCTOR.MATERIALS,
    steps: [
      {
        title: 'Subir apoyo de clase',
        content:
          'Elige el tema teórico, adjunta PDF, Word, PowerPoint o imagen (hasta 20 MB) y pulsa Subir.',
      },
      {
        title: 'Quién lo ve',
        content:
          'Solo estudiantes matriculados (activos o que completaron) en la licencia de ese tema pueden descargarlo.',
      },
    ],
  },
  {
    route: ROUTES.ADMIN.DASHBOARD,
    steps: [
      {
        title: 'Panel general',
        content:
          'Indicadores clave de la escuela: usuarios, clases del día, tendencias y actividad reciente.',
      },
      {
        title: 'Gráficas y tablas',
        content:
          'Explora la evolución de agendamientos y abre el detalle de cualquier clase desde la tabla inferior.',
      },
    ],
  },
  {
    route: ROUTES.ADMIN.USERS,
    steps: [
      {
        title: 'Directorio de usuarios',
        content:
          'Filtra por rol, busca por nombre o correo y activa o desactiva cuentas desde la tabla.',
      },
      {
        title: 'Crear y editar',
        content:
          'Usa Nuevo usuario para dar de alta estudiantes o instructores. El detalle se edita desde el modal al hacer clic en la fila.',
      },
    ],
  },
  {
    route: ROUTES.ADMIN.SCHEDULES,
    steps: [
      {
        title: 'Todos los agendamientos',
        content:
          'Vista centralizada de clases. Filtra por instructor, estudiante, fechas y estado.',
      },
      {
        title: 'Detalle y estado',
        content:
          'Abre una clase para ver participantes y cambiar el estado (pendiente, confirmada, completada, cancelada).',
      },
    ],
  },
  {
    route: ROUTES.ADMIN.VEHICLES,
    steps: [
      {
        title: 'Flota',
        content:
          'Administra placas, marca, modelo y año. Activa o desactiva vehículos sin eliminarlos del historial.',
      },
      {
        title: 'Disponibilidad',
        content:
          'Solo los vehículos activos se usan al agendar prácticas automáticas.',
      },
    ],
  },
  {
    route: ROUTES.ADMIN.COURSES,
    steps: [
      {
        title: 'Licencias y temario',
        content:
          'Selecciona una categoría (A1, B1…) para editar requisitos de teoría y práctica, y gestionar temas del temario.',
      },
      {
        title: 'Matricular estudiantes',
        content:
          'Desde cada licencia puedes matricular un estudiante para que vea su progreso en la app.',
      },
    ],
  },
  {
    route: ROUTES.ADMIN.REPORTS,
    steps: [
      {
        title: 'Métricas',
        content:
          'Revisa totales, cancelaciones y distribución teórica vs práctica en el periodo elegido.',
      },
      {
        title: 'Exportar',
        content:
          'Ajusta el rango de fechas y exporta los datos cuando necesites un informe externo.',
      },
    ],
  },
];

export function getGuidedTourForPath(pathname: string): GuidedTourDefinition | null {
  const exact = GUIDED_TOURS.find((t) => t.route === pathname);
  if (exact) return exact;
  return (
    GUIDED_TOURS.find((t) => pathname.startsWith(t.route) && t.route !== '/') ?? null
  );
}
