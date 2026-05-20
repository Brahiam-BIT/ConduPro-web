import { api } from '@/lib/axios';
import {
  mapApiSchedule,
  type ApiAvailabilityResponse,
  type ApiSchedule,
} from '@/api/schedule.mapper';
import type {
  AvailabilitySlot,
  Schedule,
  ScheduleFilters,
  ScheduleStatus,
  ScheduleType,
} from '@/types/schedule.types';
import type { PaginatedResponse } from '@/types/api.types';
import { filterSchedulesClientSide, toScheduleListParams } from '@/utils/scheduleApiParams';

export const schedulesApi = {
  async list(filters: ScheduleFilters = {}): Promise<PaginatedResponse<Schedule>> {
    const { data } = await api.get<PaginatedResponse<ApiSchedule>>('/schedules', {
      params: toScheduleListParams(filters),
    });

    let mapped = data.data.map(mapApiSchedule);

    const needsClientFilter =
      (filters.type && filters.type !== 'ALL') ||
      (filters.fromDate && filters.toDate && filters.fromDate !== filters.toDate);

    if (needsClientFilter) {
      mapped = filterSchedulesClientSide(mapped, filters);
      return {
        data: mapped,
        total: mapped.length,
        page: 1,
        limit: mapped.length || data.limit,
      };
    }

    return { ...data, data: mapped };
  },
  async byId(id: string): Promise<Schedule> {
    const { data } = await api.get<ApiSchedule>(`/schedules/${id}`);
    return mapApiSchedule(data);
  },
  /**
   * Disponibilidad de un instructor en una fecha (requiere instructorId en el backend).
   */
  async availability(params: {
    date: string;
    instructorId: string;
  }): Promise<AvailabilitySlot[]> {
    const { data } = await api.get<ApiAvailabilityResponse>('/schedules/availability', {
      params,
    });

    const instructorName = '';

    return data.slots.map((slot) => ({
      instructorId: data.instructorId,
      instructorName,
      startAt:
        typeof slot.startTime === 'string'
          ? slot.startTime
          : new Date(slot.startTime).toISOString(),
      endAt:
        typeof slot.endTime === 'string' ? slot.endTime : new Date(slot.endTime).toISOString(),
    }));
  },
  async autoAssign(payload: {
    studentId: string;
    type: ScheduleType;
    preferredDate?: string;
  }): Promise<Schedule> {
    const { data } = await api.post<ApiSchedule>('/schedules/auto-assign', {
      studentId: payload.studentId,
      type: payload.type,
      ...(payload.preferredDate ? { preferredDate: payload.preferredDate } : {}),
    });
    return mapApiSchedule(data);
  },
  async create(payload: {
    type: ScheduleType;
    studentId: string;
    instructorId: string;
    startTime: string;
    endTime?: string;
    vehicleId?: string;
    classroomId?: string;
  }): Promise<Schedule> {
    const { data } = await api.post<ApiSchedule>('/schedules', payload);
    return mapApiSchedule(data);
  },
  async updateStatus(id: string, status: ScheduleStatus): Promise<Schedule> {
    const { data } = await api.patch<ApiSchedule>(`/schedules/${id}/status`, { status });
    return mapApiSchedule(data);
  },
  async cancel(id: string): Promise<void> {
    await api.delete(`/schedules/${id}`);
  },
};
