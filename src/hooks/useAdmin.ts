import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '@/api/reports.api';
import { schedulesApi } from '@/api/schedules.api';
import { usersApi, type UserCreatePayload, type UserListFilters, type UserUpdatePayload } from '@/api/users.api';
import { vehiclesApi } from '@/api/vehicles.api';
import type { PaginatedResponse } from '@/types/api.types';
import type { Schedule, ScheduleFilters, ScheduleStatus, ScheduleType } from '@/types/schedule.types';
import type { User } from '@/types/user.types';
import type { Vehicle, VehiclePayload } from '@/types/vehicle.types';
import type { ReportDateRange } from '@/utils/reports';

export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  chart: (range: ReportDateRange) => [...adminKeys.all, 'chart', range] as const,
  recentSchedules: () => [...adminKeys.all, 'recent-schedules'] as const,
  users: (filters: UserListFilters) => [...adminKeys.all, 'users', filters] as const,
  userSearch: (search: string, role?: string) =>
    [...adminKeys.all, 'user-search', search, role] as const,
  schedules: (filters: AdminScheduleFilters) => [...adminKeys.all, 'schedules', filters] as const,
  scheduleDetail: (id: string) => ['schedules', 'detail', id] as const,
  vehicles: (page: number) => [...adminKeys.all, 'vehicles', page] as const,
  reportsSummary: (range: ReportDateRange) => [...adminKeys.all, 'reports-summary', range] as const,
  reportsInstructors: (range: ReportDateRange) =>
    [...adminKeys.all, 'reports-instructors', range] as const,
};

export interface AdminScheduleFilters {
  status?: ScheduleStatus | 'ALL';
  type?: ScheduleType | 'ALL';
  fromDate?: string;
  toDate?: string;
  instructorId?: string;
  studentId?: string;
  page?: number;
  limit?: number;
}

function buildScheduleParams(filters: AdminScheduleFilters): ScheduleFilters {
  return {
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    ...(filters.status && filters.status !== 'ALL' ? { status: filters.status } : {}),
    ...(filters.type && filters.type !== 'ALL' ? { type: filters.type } : {}),
    ...(filters.fromDate ? { fromDate: filters.fromDate } : {}),
    ...(filters.toDate ? { toDate: filters.toDate } : {}),
    ...(filters.instructorId ? { instructorId: filters.instructorId } : {}),
    ...(filters.studentId ? { studentId: filters.studentId } : {}),
  };
}

export function useAdminDashboardKpis() {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: () => reportsApi.kpis(),
  });
}

export function useAdminSchedulesChart(range: ReportDateRange) {
  return useQuery({
    queryKey: adminKeys.chart(range),
    queryFn: () =>
      reportsApi.schedulesByDay({ startDate: range.startDate, endDate: range.endDate }),
  });
}

export function useAdminRecentSchedules() {
  return useQuery({
    queryKey: adminKeys.recentSchedules(),
    queryFn: async () => {
      const result = await schedulesApi.list({ limit: 10, page: 1 });
      return result.data;
    },
  });
}

export function useAdminUsersList(filters: UserListFilters) {
  return useQuery({
    queryKey: adminKeys.users(filters),
    queryFn: () => usersApi.list(filters),
  });
}

export function useUserSearch(search: string, role?: 'STUDENT' | 'INSTRUCTOR') {
  return useQuery({
    queryKey: adminKeys.userSearch(search, role),
    queryFn: () =>
      usersApi.list({
        search: search || undefined,
        role,
        limit: 25,
        page: 1,
      }),
    enabled: search.length >= 0,
    staleTime: 1000 * 30,
  });
}

export function useAdminSchedulesList(filters: AdminScheduleFilters) {
  return useQuery({
    queryKey: adminKeys.schedules(filters),
    queryFn: () => schedulesApi.list(buildScheduleParams(filters)),
  });
}

export function useAdminScheduleDetail(id: string | null) {
  return useQuery({
    queryKey: adminKeys.scheduleDetail(id ?? ''),
    queryFn: () => schedulesApi.byId(id!),
    enabled: !!id,
  });
}

export function useAdminUpdateScheduleStatus(filters: AdminScheduleFilters) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ScheduleStatus }) =>
      schedulesApi.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.schedules(filters) });
      const previous = queryClient.getQueryData<PaginatedResponse<Schedule>>(
        adminKeys.schedules(filters),
      );
      if (previous) {
        queryClient.setQueryData(adminKeys.schedules(filters), {
          ...previous,
          data: previous.data.map((s) => (s.id === id ? { ...s, status } : s)),
        });
      }
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(adminKeys.schedules(filters), ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useAdminCancelSchedule(filters: AdminScheduleFilters) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schedulesApi.cancel(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminKeys.schedules(filters) });
      const previous = queryClient.getQueryData<PaginatedResponse<Schedule>>(
        adminKeys.schedules(filters),
      );
      if (previous) {
        queryClient.setQueryData(adminKeys.schedules(filters), {
          ...previous,
          data: previous.data.map((s) =>
            s.id === id ? { ...s, status: 'CANCELLED' as const } : s,
          ),
        });
      }
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(adminKeys.schedules(filters), ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserCreatePayload) => usersApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UserUpdatePayload }) =>
      usersApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersApi.toggleActive(id, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useAdminVehiclesList(page: number) {
  return useQuery({
    queryKey: adminKeys.vehicles(page),
    queryFn: () => vehiclesApi.list({ page, limit: 10 }),
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VehiclePayload) => vehiclesApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<VehiclePayload> }) =>
      vehiclesApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehiclesApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useReportSummary(range: ReportDateRange) {
  return useQuery({
    queryKey: adminKeys.reportsSummary(range),
    queryFn: () =>
      reportsApi.summary({ startDate: range.startDate, endDate: range.endDate }),
  });
}

export function useReportByInstructor(range: ReportDateRange) {
  return useQuery({
    queryKey: adminKeys.reportsInstructors(range),
    queryFn: () =>
      reportsApi.byInstructor({ startDate: range.startDate, endDate: range.endDate }),
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: (range: ReportDateRange) =>
      reportsApi.exportUrl({ startDate: range.startDate, endDate: range.endDate }),
  });
}

export type { User, Vehicle, Schedule };
