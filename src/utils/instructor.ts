import {
  endOfMonth,
  endOfWeek,
  getHours,
  isAfter,
  isBefore,
  isSameDay,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type { Schedule } from '@/types/schedule.types';
import type { UserAvailabilitySlot } from '@/types/user.types';

export function formatStudentName(
  student: Pick<{ firstName: string; lastName: string }, 'firstName' | 'lastName'>,
): string {
  return `${student.firstName} ${student.lastName}`.trim();
}

export function canCompleteSchedule(schedule: Schedule): boolean {
  return schedule.status === 'PENDING' || schedule.status === 'CONFIRMED';
}

/** Columnas lun–dom → dayOfWeek del backend (0=domingo). */
export const WEEKDAY_COLUMNS: { label: string; dayOfWeek: number }[] = [
  { label: 'Lun', dayOfWeek: 1 },
  { label: 'Mar', dayOfWeek: 2 },
  { label: 'Mié', dayOfWeek: 3 },
  { label: 'Jue', dayOfWeek: 4 },
  { label: 'Vie', dayOfWeek: 5 },
  { label: 'Sáb', dayOfWeek: 6 },
  { label: 'Dom', dayOfWeek: 0 },
];

/** Filas del mini calendario del dashboard (8 franjas desde las 7:00). */
export const DASHBOARD_HOUR_ROWS = [7, 8, 9, 10, 11, 12, 13, 14] as const;

/** Franjas horarias de disponibilidad 7:00–19:00. */
export const AVAILABILITY_HOURS = Array.from({ length: 13 }, (_, i) => i + 7);

export function availabilitySlotKey(dayOfWeek: number, hour: number): string {
  return `${dayOfWeek}-${hour}`;
}

export interface InstructorDashboardMetrics {
  todayClasses: Schedule[];
  weekTotal: number;
  weekHours: number;
  monthTotal: number;
  monthCompleted: number;
  weekSchedules: Schedule[];
}

export function computeInstructorDashboardMetrics(schedules: Schedule[]): InstructorDashboardMetrics {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const active = schedules.filter((s) => s.status !== 'CANCELLED');

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

export function buildFullAvailabilityGrid(
  saved: UserAvailabilitySlot[],
): Map<string, boolean> {
  const map = new Map<string, boolean>();
  for (const col of WEEKDAY_COLUMNS) {
    for (const hour of AVAILABILITY_HOURS) {
      map.set(availabilitySlotKey(col.dayOfWeek, hour), false);
    }
  }
  for (const slot of saved) {
    map.set(availabilitySlotKey(slot.dayOfWeek, slot.hour), slot.available);
  }
  return map;
}

export function mapToAvailabilitySlots(map: Map<string, boolean>): UserAvailabilitySlot[] {
  const slots: UserAvailabilitySlot[] = [];
  map.forEach((available, key) => {
    const [dayStr, hourStr] = key.split('-');
    const dayOfWeek = Number(dayStr);
    const hour = Number(hourStr);
    if (!Number.isNaN(dayOfWeek) && !Number.isNaN(hour)) {
      slots.push({ dayOfWeek, hour, available });
    }
  });
  return slots;
}

/** Clases agendadas que bloquean edición en la grilla de disponibilidad. */
export function scheduledSlotsForAvailability(
  schedules: Schedule[],
): Set<string> {
  const set = new Set<string>();
  for (const s of schedules) {
    if (s.status === 'CANCELLED') continue;
    const start = parseISO(s.startAt);
    const day = start.getDay();
    const startHour = getHours(start);
    const endHour = getHours(parseISO(s.endAt));
    for (let h = startHour; h < endHour; h++) {
      if (AVAILABILITY_HOURS.includes(h)) {
        set.add(availabilitySlotKey(day, h));
      }
    }
  }
  return set;
}
