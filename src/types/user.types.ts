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

export interface UserAvailabilitySlot {
  dayOfWeek: number; // 0 = domingo .. 6 = sábado
  hour: number; // 0..23
  available: boolean;
}
