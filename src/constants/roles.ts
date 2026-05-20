export const ROLES = {
  STUDENT: 'STUDENT',
  INSTRUCTOR: 'INSTRUCTOR',
  ADMIN: 'ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  STUDENT: 'Estudiante',
  INSTRUCTOR: 'Instructor',
  ADMIN: 'Administrador',
};
