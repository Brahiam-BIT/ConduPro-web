import {
  endOfMonth,
  endOfWeek,
  getHours,
  isAfter,
  isBefore,
  isSameDay,
  isToday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type { AvailabilityCellData } from '@/types/availability.types';
import type { Schedule } from '@/types/schedule.types';

export function formatStudentName(
  student: Pick<{ firstName: string; lastName: string }, 'firstName' | 'lastName'>,
): string {
  return `${student.firstName} ${student.lastName}`.trim();
}

export function canCompleteSchedule(schedule: Schedule): boolean {
  return schedule.status === 'PENDING' || schedule.status === 'CONFIRMED';
}

import {
  AVAILABILITY_HOURS,
  availabilityDateKey,
  isDateInWorkWeek,
  WORK_WEEK_DAYS,
} from '@/utils/availability';

/** Columnas lun–vie (academia solo días laborales). */
export const WEEKDAY_COLUMNS = WORK_WEEK_DAYS;

/** Filas del mini calendario del dashboard (8 franjas desde las 7:00). */
export const DASHBOARD_HOUR_ROWS = [7, 8, 9, 10, 11, 12, 13, 14] as const;

export { AVAILABILITY_HOURS, availabilityDateKey, WORK_WEEK_DAYS };

export interface InstructorDashboardMetrics {
  todayClasses: Schedule[];
  weekTotal: number;
  weekHours: number;
  monthTotal: number;
  monthCompleted: number;
  weekSchedules: Schedule[];
}

export function computeInstructorDashboardMetrics(
  schedules: Schedule[] | undefined | null,
): InstructorDashboardMetrics {
  const list = schedules ?? [];
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const active = list.filter((s) => s.status !== 'CANCELLED');

  const todayClasses = active
    .filter((s) => isToday(parseISO(s.startAt)))
    .sort((a, b) => parseISO(a.startAt).getTime() - parseISO(b.startAt).getTime());

  const weekSchedules = active.filter((s) => {
    const start = parseISO(s.startAt);
    return !isBefore(start, weekStart) && !isAfter(start, weekEnd);
  });

  const weekTotal = weekSchedules.length;
  const weekHours =
    Math.round((weekSchedules.reduce((sum, s) => sum + s.durationMinutes, 0) / 60) * 10) / 10;

  const monthSchedules = active.filter((s) => {
    const start = parseISO(s.startAt);
    return !isBefore(start, monthStart) && !isAfter(start, monthEnd);
  });

  return {
    todayClasses,
    weekTotal,
    weekHours,
    monthTotal: monthSchedules.length,
    monthCompleted: monthSchedules.filter((s) => s.status === 'COMPLETED').length,
    weekSchedules,
  };
}

/** Clases que ocupan una celda (día de semana + hora) en la semana actual. */
export function schedulesForWeekCell(
  schedules: Schedule[],
  weekStart: Date,
  dayOfWeek: number,
  hour: number,
): Schedule[] {
  const colIndex = WEEKDAY_COLUMNS.findIndex((c) => c.dayOfWeek === dayOfWeek);
  if (colIndex < 0) return [];
  const cellDate = new Date(weekStart);
  cellDate.setDate(weekStart.getDate() + colIndex);

  return schedules.filter((s) => {
    if (s.status === 'CANCELLED') return false;
    const start = parseISO(s.startAt);
    if (!isSameDay(start, cellDate)) return false;
    const startHour = getHours(start);
    const endHour = getHours(parseISO(s.endAt));
    return hour >= startHour && hour < endHour;
  });
}

function scheduleToCellPreview(schedule: Schedule): AvailabilityCellData {
  if (schedule.type === 'PRACTICE') {
    return {
      available: true,
      classType: 'PRACTICE',
      recurrence: 'WEEKLY',
      theoryTopicId: null,
      licenseCategoryId: null,
    };
  }
  return {
    available: true,
    classType: 'THEORY',
    theoryTopicId: schedule.theoryTopic?.id ?? null,
    theoryTopicTitle: schedule.theoryTopic?.title,
    licenseCategoryId: schedule.licenseCategory?.id ?? null,
    licenseCategoryCode: schedule.licenseCategory?.code,
    recurrence: 'WEEKLY',
  };
}

/** Clases ya agendadas en la semana visible (morado, solo lectura). */
export function scheduledCellsForAvailabilityWeek(
  schedules: Schedule[],
  weekMonday: Date,
): Map<string, AvailabilityCellData> {
  const map = new Map<string, AvailabilityCellData>();
  for (const s of schedules) {
    if (s.status === 'CANCELLED') continue;
    const start = parseISO(s.startAt);
    if (!isDateInWorkWeek(start, weekMonday)) continue;
    const day = start.getDay();
    if (day < 1 || day > 5) continue;
    const startHour = getHours(start);
    const endHour = getHours(parseISO(s.endAt));
    const preview = scheduleToCellPreview(s);
    for (let h = startHour; h < endHour; h++) {
      if (AVAILABILITY_HOURS.includes(h)) {
        map.set(availabilityDateKey(startOfDay(start), h), preview);
      }
    }
  }
  return map;
}
