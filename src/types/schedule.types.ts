import type { Vehicle } from './vehicle.types';

export type ScheduleStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type ScheduleType = 'THEORY' | 'PRACTICE';

export interface ScheduleParticipant {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  email?: string;
  phone?: string | null;
}

export interface ScheduleTheoryTopic {
  id: string;
  title: string;
}

export interface ScheduleLicenseCategory {
  id: string;
  code: string;
  name: string;
}

export interface Schedule {
  id: string;
  type: ScheduleType;
  status: ScheduleStatus;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  student: ScheduleParticipant;
  instructor: ScheduleParticipant;
  vehicle?: Pick<Vehicle, 'id' | 'plate' | 'brand' | 'model'> | null;
  classroom?: { id: string; name: string } | null;
  theoryTopic?: ScheduleTheoryTopic | null;
  licenseCategory?: ScheduleLicenseCategory | null;
  notes?: string;
  createdAt: string;
}

export interface ScheduleFilters {
  status?: ScheduleStatus | 'ALL';
  type?: ScheduleType | 'ALL';
  fromDate?: string;
  toDate?: string;
  instructorId?: string;
  studentId?: string;
  page?: number;
  limit?: number;
}

export interface AvailabilitySlot {
  instructorId: string;
  instructorName: string;
  startAt: string;
  endAt: string;
  vehicleId?: string;
}
