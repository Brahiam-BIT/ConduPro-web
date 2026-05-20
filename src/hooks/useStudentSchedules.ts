import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { schedulesApi } from '@/api/schedules.api';
import { computeStudentDashboardMetrics } from '@/utils/schedule';
import type { ScheduleFilters, ScheduleStatus, ScheduleType } from '@/types/schedule.types';
import type { AvailabilitySlot, Schedule } from '@/types/schedule.types';

export const studentScheduleKeys = {
  all: ['schedules', 'student'] as const,
  list: (filters: StudentScheduleListFilters) => [...studentScheduleKeys.all, 'list', filters] as const,
  dashboard: () => [...studentScheduleKeys.all, 'dashboard'] as const,
  detail: (id: string) => [...studentScheduleKeys.all, 'detail', id] as const,
  availability: (date: string, type: ScheduleType) =>
    [...studentScheduleKeys.all, 'availability', date, type] as const,
};

export interface StudentScheduleListFilters {
  status?: ScheduleStatus | 'ALL';
  type?: ScheduleType | 'ALL';
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

function buildListParams(filters: StudentScheduleListFilters): ScheduleFilters {
  return {
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    ...(filters.status && filters.status !== 'ALL' ? { status: filters.status } : {}),
    ...(filters.type && filters.type !== 'ALL' ? { type: filters.type } : {}),
    ...(filters.fromDate ? { fromDate: filters.fromDate } : {}),
    ...(filters.toDate ? { toDate: filters.toDate } : {}),
  };
}

export function useStudentDashboard() {
  return useQuery({
    queryKey: studentScheduleKeys.dashboard(),
    queryFn: async () => {
      const { data } = await schedulesApi.list({ limit: 100 });
      return computeStudentDashboardMetrics(data);
    },
  });
}

export function useStudentSchedulesList(filters: StudentScheduleListFilters) {
  return useQuery({
    queryKey: studentScheduleKeys.list(filters),
    queryFn: () => schedulesApi.list(buildListParams(filters)),
  });
}

export function useScheduleDetail(id: string | null) {
  return useQuery({
    queryKey: studentScheduleKeys.detail(id ?? ''),
    queryFn: () => schedulesApi.byId(id!),
    enabled: !!id,
  });
}

export function useAvailabilitySlots(date: string | null, type: ScheduleType | null) {
  return useQuery({
    queryKey: studentScheduleKeys.availability(date ?? '', type ?? 'THEORY'),
    queryFn: () =>
      schedulesApi.availability({ date: date!, type: type! }),
    enabled: !!date && !!type,
  });
}

export function useCancelSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schedulesApi.cancel(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: studentScheduleKeys.all });
    },
  });
}

export function useBookSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: schedulesApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: studentScheduleKeys.all });
    },
  });
}

export function useAutoAssignSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: schedulesApi.autoAssign,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: studentScheduleKeys.all });
    },
  });
}

export type { AvailabilitySlot, Schedule };
