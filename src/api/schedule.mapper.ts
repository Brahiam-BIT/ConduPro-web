import type { Schedule, ScheduleStatus, ScheduleType } from '@/types/schedule.types';

/** Forma de schedule devuelta por ConduPro API v1. */
export interface ApiSchedule {
  id: string;
  type: ScheduleType;
  status: ScheduleStatus;
  startTime: string;
  endTime: string;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string | null;
  };
  classroom?: { id: string; name: string } | null;
  theoryTopic?: { id: string; title: string } | null;
  licenseCategory?: { id: string; code: string; name: string } | null;
  instructor?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  vehicle?: {
    id: string;
    plate: string;
    brand: string;
    model: string;
  } | null;
}

export interface ApiAvailabilitySlot {
  startTime: string;
  endTime: string;
}

export interface ApiAvailabilityResponse {
  date: string;
  instructorId: string;
  slots: ApiAvailabilitySlot[];
}

export function mapApiSchedule(dto: ApiSchedule): Schedule {
  const startAt =
    typeof dto.startTime === 'string' ? dto.startTime : new Date(dto.startTime).toISOString();
  const endAt =
    typeof dto.endTime === 'string' ? dto.endTime : new Date(dto.endTime).toISOString();
  const durationMinutes = Math.max(
    0,
    Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000),
  );

  return {
    id: dto.id,
    type: dto.type,
    status: dto.status,
    startAt,
    endAt,
    durationMinutes,
    student: dto.student
      ? {
          id: dto.student.id,
          firstName: dto.student.firstName,
          lastName: dto.student.lastName,
          email: dto.student.email,
          phone: dto.student.phone ?? null,
          avatarUrl: null,
        }
      : { id: '', firstName: '', lastName: '', avatarUrl: null },
    instructor: dto.instructor
      ? {
          id: dto.instructor.id,
          firstName: dto.instructor.firstName,
          lastName: dto.instructor.lastName,
          avatarUrl: null,
        }
      : { id: '', firstName: '', lastName: '', avatarUrl: null },
    vehicle: dto.vehicle
      ? {
          id: dto.vehicle.id,
          plate: dto.vehicle.plate,
          brand: dto.vehicle.brand,
          model: dto.vehicle.model,
        }
      : null,
    classroom: dto.classroom ?? null,
    theoryTopic: dto.theoryTopic ?? null,
    licenseCategory: dto.licenseCategory ?? null,
    notes: dto.notes ?? undefined,
    createdAt:
      typeof dto.createdAt === 'string' ? dto.createdAt : new Date(dto.createdAt).toISOString(),
  };
}
