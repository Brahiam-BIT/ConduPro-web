import type { ScheduleFilters, ScheduleType } from '@/types/schedule.types';

/**
 * Parámetros que acepta GET /api/v1/schedules (ScheduleQueryDto en el backend).
 * No envía type/fromDate/toDate: el backend los rechaza (400) y no los soporta aún.
 */
export function toScheduleListParams(filters: ScheduleFilters = {}): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;
  if (filters.instructorId) params.instructorId = filters.instructorId;
  if (filters.studentId) params.studentId = filters.studentId;
  if (filters.status && filters.status !== 'ALL') params.status = filters.status;

  if (filters.fromDate && filters.toDate && filters.fromDate === filters.toDate) {
    params.date = filters.fromDate;
  } else if (filters.fromDate && !filters.toDate) {
    params.date = filters.fromDate;
  }

  return params;
}

export function filterSchedulesClientSide<T extends { type: ScheduleType; startAt: string }>(
  items: T[],
  filters: Pick<ScheduleFilters, 'type' | 'fromDate' | 'toDate'>,
): T[] {
  let result = items;

  if (filters.type && filters.type !== 'ALL') {
    result = result.filter((s) => s.type === filters.type);
  }

  if (filters.fromDate) {
    result = result.filter((s) => s.startAt.slice(0, 10) >= filters.fromDate!);
  }

  if (filters.toDate) {
    result = result.filter((s) => s.startAt.slice(0, 10) <= filters.toDate!);
  }

  return result;
}
