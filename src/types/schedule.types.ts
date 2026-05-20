import type { User } from './user.types';
import type { Vehicle } from './vehicle.types';

export type ScheduleStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type ScheduleType = 'THEORY' | 'PRACTICE';

export interface Schedule {
  id: string;
  type: ScheduleType;
  status: ScheduleStatus;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  student: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  instructor: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  vehicle?: Pick<Vehicle, 'id' | 'plate' | 'brand' | 'model'> | null;
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
