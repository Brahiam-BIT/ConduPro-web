export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  UNAUTHORIZED: '/unauthorized',
  STUDENT: {
    ROOT: '/student',
    DASHBOARD: '/student/dashboard',
    SCHEDULES: '/student/schedules',
    BOOK: '/student/book',
    LICENSES: '/student/licenses',
  },
  INSTRUCTOR: {
    ROOT: '/instructor',
    DASHBOARD: '/instructor/dashboard',
    SCHEDULES: '/instructor/schedules',
    AVAILABILITY: '/instructor/availability',
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
  },
} as const;

export const ROLE_DEFAULT_ROUTE = {
  STUDENT: ROUTES.STUDENT.DASHBOARD,
  INSTRUCTOR: ROUTES.INSTRUCTOR.DASHBOARD,
  ADMIN: ROUTES.ADMIN.DASHBOARD,
} as const;
