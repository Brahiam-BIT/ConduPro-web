import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { schedulesApi } from '@/api/schedules.api';
import { useAuth } from '@/hooks/useAuth';
import { EMPTY_STUDENT_DASHBOARD } from '@/constants/dashboardDefaults';
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
      const res = await schedulesApi.list({ limit: 100 });
      const rows = Array.isArray(res?.data) ? res.data : [];
      return computeStudentDashboardMetrics(rows);
    },
    placeholderData: EMPTY_STUDENT_DASHBOARD,
    meta: { skipGlobalErrorHandler: true },
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

/** Requiere instructorId; deshabilitado hasta exponer listado de instructores en el API. */
export function useAvailabilitySlots(
  _date: string | null,
  _type: ScheduleType | null,
  instructorId?: string | null,
) {
  return useQuery({
    queryKey: studentScheduleKeys.availability('', 'THEORY'),
    queryFn: () => schedulesApi.availability({ date: _date!, instructorId: instructorId! }),
    enabled: false,
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
  const { user } = useAuth();
  return useMutation({
    mutationFn: (payload: {
      type: ScheduleType;
      preferredDate?: string;
      licenseCategoryId?: string;
    }) => {
      if (!user) throw new Error('Debes iniciar sesión');
      return schedulesApi.autoAssign({
        studentId: user.id,
        type: payload.type,
        preferredDate: payload.preferredDate,
        licenseCategoryId: payload.licenseCategoryId,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: studentScheduleKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}

export type { AvailabilitySlot, Schedule };
