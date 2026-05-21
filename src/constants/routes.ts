export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  UNAUTHORIZED: '/unauthorized',
  STUDENT: {
    ROOT: '/student',
    DASHBOARD: '/student/dashboard',
    SCHEDULES: '/student/schedules',
    BOOK: '/student/book',
    BOOK_THEORY: '/student/book/theory',
    BOOK_PRACTICE: '/student/book/practice',
    LICENSES: '/student/licenses',
    MATERIALS: '/student/materials',
    /** @deprecated Usar BOOK_THEORY — redirige en el router */
    THEORY_CLASSES: '/student/theory-classes',
  },
  INSTRUCTOR: {
    ROOT: '/instructor',
    DASHBOARD: '/instructor/dashboard',
    SCHEDULES: '/instructor/schedules',
    AVAILABILITY: '/instructor/availability',
    MATERIALS: '/instructor/materials',
  },
  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    SCHEDULES: '/admin/schedules',
    VEHICLES: '/admin/vehicles',
    COURSES: '/admin/courses',
    REPORTS: '/admin/reports',
  },
  DEV: {
    COMPONENTS: '/dev/components',
    THREE_TEST: '/dev/three-test',
  },
} as const;

export const ROLE_DEFAULT_ROUTE = {
  STUDENT: ROUTES.STUDENT.DASHBOARD,
  INSTRUCTOR: ROUTES.INSTRUCTOR.DASHBOARD,
  ADMIN: ROUTES.ADMIN.DASHBOARD,
} as const;
