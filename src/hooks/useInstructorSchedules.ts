import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { schedulesApi } from '@/api/schedules.api';
import { usersApi } from '@/api/users.api';
import { EMPTY_INSTRUCTOR_DASHBOARD } from '@/constants/dashboardDefaults';
import { computeInstructorDashboardMetrics } from '@/utils/instructor';
import type { ScheduleFilters, ScheduleStatus, ScheduleType } from '@/types/schedule.types';
import type { Schedule } from '@/types/schedule.types';
import type { UserAvailabilitySlot } from '@/types/user.types';
import type { PaginatedResponse } from '@/types/api.types';

export interface ScheduleListFilters {
  status?: ScheduleStatus | 'ALL';
  type?: ScheduleType | 'ALL';
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

const INSTRUCTOR_BULK_LIMIT = 200;

export const instructorScheduleKeys = {
  all: ['schedules', 'instructor'] as const,
  bulk: () => [...instructorScheduleKeys.all, 'bulk', INSTRUCTOR_BULK_LIMIT] as const,
  list: (filters: ScheduleListFilters) => [...instructorScheduleKeys.all, 'list', filters] as const,
  dashboard: () => [...instructorScheduleKeys.all, 'dashboard'] as const,
  detail: (id: string) => ['schedules', 'detail', id] as const,
  availability: (userId: string) => [...instructorScheduleKeys.all, 'availability', userId] as const,
};

/** Una sola petición limit=200 compartida por dashboard y grilla semanal. */
export function useInstructorSchedulesBulk() {
  return useQuery({
    queryKey: instructorScheduleKeys.bulk(),
    queryFn: async () => {
      const res = await schedulesApi.list({ limit: INSTRUCTOR_BULK_LIMIT });
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 1000 * 30,
    meta: { skipGlobalErrorHandler: true },
  });
}

function buildListParams(filters: ScheduleListFilters): ScheduleFilters {
  return {
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    ...(filters.status && filters.status !== 'ALL' ? { status: filters.status } : {}),
    ...(filters.type && filters.type !== 'ALL' ? { type: filters.type } : {}),
    ...(filters.fromDate ? { fromDate: filters.fromDate } : {}),
    ...(filters.toDate ? { toDate: filters.toDate } : {}),
  };
}

export function useInstructorDashboard() {
  const bulk = useInstructorSchedulesBulk();
  return {
    ...bulk,
    data: computeInstructorDashboardMetrics(bulk.data ?? []),
    placeholderData: EMPTY_INSTRUCTOR_DASHBOARD,
  };
}

export function useInstructorSchedulesList(filters: ScheduleListFilters) {
  return useQuery({
    queryKey: instructorScheduleKeys.list(filters),
    queryFn: () => schedulesApi.list(buildListParams(filters)),
  });
}

export function useInstructorScheduleDetail(id: string | null) {
  return useQuery({
    queryKey: instructorScheduleKeys.detail(id ?? ''),
    queryFn: () => schedulesApi.byId(id!),
    enabled: !!id,
  });
}

export function useInstructorWeekSchedules() {
  const bulk = useInstructorSchedulesBulk();
  return {
    ...bulk,
    data: (bulk.data ?? []).filter((s) => s.status !== 'CANCELLED'),
  };
}

export function useInstructorAvailability(userId: string | null) {
  return useQuery({
    queryKey: instructorScheduleKeys.availability(userId ?? ''),
    queryFn: () => usersApi.availability(userId!),
    enabled: !!userId,
  });
}

export function useUpdateScheduleStatus(filters: ScheduleListFilters) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ScheduleStatus }) =>
      schedulesApi.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: instructorScheduleKeys.list(filters) });
      const previous = queryClient.getQueryData<PaginatedResponse<Schedule>>(
        instructorScheduleKeys.list(filters),
      );
      if (previous) {
        queryClient.setQueryData<PaginatedResponse<Schedule>>(instructorScheduleKeys.list(filters), {
          ...previous,
          data: previous.data.map((s) => (s.id === id ? { ...s, status } : s)),
        });
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(instructorScheduleKeys.list(filters), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: instructorScheduleKeys.all });
    },
  });
}

export function useCancelScheduleAsInstructor(filters: ScheduleListFilters) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => schedulesApi.cancel(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: instructorScheduleKeys.list(filters) });
      const previous = queryClient.getQueryData<PaginatedResponse<Schedule>>(
        instructorScheduleKeys.list(filters),
      );
      if (previous) {
        queryClient.setQueryData<PaginatedResponse<Schedule>>(instructorScheduleKeys.list(filters), {
          ...previous,
          data: previous.data.map((s) =>
            s.id === id ? { ...s, status: 'CANCELLED' as const } : s,
          ),
        });
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(instructorScheduleKeys.list(filters), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: instructorScheduleKeys.all });
    },
  });
}

export function useSaveInstructorAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, slots }: { userId: string; slots: UserAvailabilitySlot[] }) =>
      usersApi.setAvailability(userId, slots),
    onSuccess: (_data, { userId }) => {
      void queryClient.invalidateQueries({
        queryKey: instructorScheduleKeys.availability(userId),
      });
    },
  });
}
