import type { Role } from '@/constants/roles';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** @deprecated Usar tipos de `@/types/availability.types` */
export type { UserAvailabilitySlot } from '@/types/availability.types';
