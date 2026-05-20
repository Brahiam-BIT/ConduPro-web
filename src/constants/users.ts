import type { Role } from '@/constants/roles';

export const USER_ROLE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Todos' },
  { value: 'STUDENT', label: 'Estudiantes' },
  { value: 'INSTRUCTOR', label: 'Instructores' },
  { value: 'ADMIN', label: 'Administradores' },
] as const;

export type UserRoleFilter = (typeof USER_ROLE_FILTER_OPTIONS)[number]['value'];

export function roleFilterToParam(role: UserRoleFilter): Role | undefined {
  return role === 'ALL' ? undefined : role;
}
