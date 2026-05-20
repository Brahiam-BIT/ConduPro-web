import {
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isWeekend,
  parseISO,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import type { Schedule } from '@/types/schedule.types';

export function formatInstructorName(
  instructor: Pick<{ firstName: string; lastName: string }, 'firstName' | 'lastName'>,
): string {
  return `${instructor.firstName} ${instructor.lastName}`.trim();
}

export function toApiDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** Solo lunes–viernes, sin fechas pasadas. */
export function isBookableDay(date: Date): boolean {
  const today = startOfDay(new Date());
  return !isWeekend(date) && !isBefore(startOfDay(date), today);
}

export function canCancelSchedule(schedule: Schedule): boolean {
  if (schedule.status === 'CANCELLED' || schedule.status === 'COMPLETED') return false;
  return isAfter(parseISO(schedule.startAt), new Date());
}

export interface StudentDashboardMetrics {
  nextClass: Schedule | null;
  completedCount: number;
  weekCount: number;
  totalHours: number;
  recentSchedules: Schedule[];
}

export function computeStudentDashboardMetrics(
  schedules: Schedule[] | undefined | null,
): StudentDashboardMetrics {
  const list = schedules ?? [];
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const active = list.filter((s) => s.status !== 'CANCELLED');

  const nextClass =
    active
      .filter(
        (s) =>
          isAfter(parseISO(s.startAt), now) &&
          (s.status === 'PENDING' || s.status === 'CONFIRMED'),
      )
      .sort((a, b) => parseISO(a.startAt).getTime() - parseISO(b.startAt).getTime())[0] ?? null;

  const completedCount = list.filter((s) => s.status === 'COMPLETED').length;

  const weekCount = active.filter((s) => {
    const start = parseISO(s.startAt);
    return !isBefore(start, weekStart) && !isAfter(start, weekEnd);
  }).length;

  const totalMinutes = list
    .filter((s) => s.status === 'COMPLETED')
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const recentSchedules = [...list]
    .sort((a, b) => parseISO(b.startAt).getTime() - parseISO(a.startAt).getTime())
    .slice(0, 5);

  return {
    nextClass,
    completedCount,
    weekCount,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    recentSchedules,
  };
}
