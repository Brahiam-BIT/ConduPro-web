import { api } from '@/lib/axios';
import type { AvailabilitySlot, Schedule, ScheduleFilters, ScheduleStatus, ScheduleType } from '@/types/schedule.types';
import type { PaginatedResponse } from '@/types/api.types';

export const schedulesApi = {
  async list(filters: ScheduleFilters = {}): Promise<PaginatedResponse<Schedule>> {
    const { data } = await api.get<PaginatedResponse<Schedule>>('/schedules', { params: filters });
    return data;
  },
  async byId(id: string): Promise<Schedule> {
    const { data } = await api.get<Schedule>(`/schedules/${id}`);
    return data;
  },
  async availability(params: { date: string; type: ScheduleType }): Promise<AvailabilitySlot[]> {
    const { data } = await api.get<AvailabilitySlot[]>('/schedules/availability', { params });
    return data;
  },
  async autoAssign(payload: { date: string; type: ScheduleType }): Promise<Schedule> {
    const { data } = await api.post<Schedule>('/schedules/auto-assign', payload);
    return data;
  },
  async create(payload: {
    type: ScheduleType;
    instructorId: string;
    startAt: string;
    vehicleId?: string;
  }): Promise<Schedule> {
    const { data } = await api.post<Schedule>('/schedules', payload);
    return data;
  },
  async updateStatus(id: string, status: ScheduleStatus): Promise<Schedule> {
    const { data } = await api.patch<Schedule>(`/schedules/${id}/status`, { status });
    return data;
  },
  async cancel(id: string): Promise<Schedule> {
    const { data } = await api.patch<Schedule>(`/schedules/${id}/status`, { status: 'CANCELLED' });
    return data;
  },
};
