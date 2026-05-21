import {
  addDays,
  endOfDay,
  format,
  isBefore,
  isToday,
  parseISO,
  startOfDay,
  startOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import type {
  AvailabilityCellData,
  AvailabilityRecurrence,
  AvailabilitySlotTemplate,
  BulkApplyScope,
  UserAvailabilitySlot,
} from '@/types/availability.types';

/** Academia: solo lunes a viernes (1–5, alineado con Date.getDay(): 1=lun … 5=vie). */
export const WORK_WEEK_DAYS: { label: string; dayOfWeek: number }[] = [
  { label: 'Lun', dayOfWeek: 1 },
  { label: 'Mar', dayOfWeek: 2 },
  { label: 'Mié', dayOfWeek: 3 },
  { label: 'Jue', dayOfWeek: 4 },
  { label: 'Vie', dayOfWeek: 5 },
];

export interface WorkWeekColumn {
  dayOfWeek: number;
  /** Abreviatura sin fecha (Lun) */
  label: string;
  /** Encabezado con fecha: «Lun 20» */
  headerLabel: string;
  /** Título largo: «Lunes 20 de mayo» */
  fullLabel: string;
  date: Date;
  isToday: boolean;
  /** Fecha calendario ya transcurrió (solo lectura en la grilla). */
  isPast: boolean;
}

export function isWorkWeekDayPast(date: Date): boolean {
  return isBefore(startOfDay(date), startOfDay(new Date()));
}

/** Lunes de la semana que contiene `ref` (o la semana actual). */
export function getMondayOfWeek(ref: Date = new Date()): Date {
  return startOfWeek(ref, { weekStartsOn: 1 });
}

/** Columnas lun–vie con fechas concretas de la semana que empieza en `weekMonday`. */
export function getWorkWeekColumns(weekMonday: Date): WorkWeekColumn[] {
  const monday = getMondayOfWeek(weekMonday);
  return WORK_WEEK_DAYS.map((col) => {
    const date = addDays(monday, col.dayOfWeek - 1);
    return {
      dayOfWeek: col.dayOfWeek,
      label: col.label,
      headerLabel: format(date, 'EEE d', { locale: es }),
      fullLabel: format(date, "EEEE d 'de' MMMM", { locale: es }),
      date,
      isToday: isToday(date),
      isPast: isWorkWeekDayPast(date),
    };
  });
}

/** Rango visible: «20 – 24 may 2026». */
export function formatWorkWeekRange(weekMonday: Date): string {
  const monday = getMondayOfWeek(weekMonday);
  const friday = addDays(monday, 4);
  const sameYear = monday.getFullYear() === friday.getFullYear();
  const startFmt = format(monday, 'd MMM', { locale: es });
  const endFmt = format(friday, sameYear ? 'd MMM yyyy' : 'd MMM yyyy', { locale: es });
  return `${startFmt} – ${endFmt}`;
}

export function isDateInWorkWeek(date: Date, weekMonday: Date): boolean {
  const monday = startOfWeek(weekMonday, { weekStartsOn: 1 });
  const fridayEnd = endOfDay(addDays(monday, 4));
  return date >= monday && date <= fridayEnd;
}

export const AVAILABILITY_HOURS = Array.from({ length: 13 }, (_, i) => i + 7);

/** Clave por día de semana (legacy / clases agendadas en la semana visible). */
export function availabilitySlotKey(dayOfWeek: number, hour: number): string {
  return `${dayOfWeek}-${hour}`;
}

/** Clave por fecha calendario — cada celda es un día concreto. */
export function availabilityDateKey(date: Date, hour: number): string {
  return `${format(startOfDay(date), 'yyyy-MM-dd')}-${hour}`;
}

export const DEFAULT_SLOT_TEMPLATE: AvailabilitySlotTemplate = {
  available: true,
  classType: 'PRACTICE',
  recurrence: 'WEEKLY',
};

export function createEmptyAvailabilityGridForWeek(
  weekMonday: Date,
): Map<string, AvailabilityCellData> {
  const map = new Map<string, AvailabilityCellData>();
  for (const col of getWorkWeekColumns(weekMonday)) {
    for (const hour of AVAILABILITY_HOURS) {
      map.set(availabilityDateKey(col.date, hour), {
        available: false,
        classType: 'PRACTICE',
        recurrence: 'WEEKLY',
      });
    }
  }
  return map;
}

/** @deprecated Usar createEmptyAvailabilityGridForWeek */
export function createEmptyAvailabilityGrid(): Map<string, AvailabilityCellData> {
  return createEmptyAvailabilityGridForWeek(getMondayOfWeek(new Date()));
}

export function truncateTopicLabel(title: string, max = 28): string {
  const t = title.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** Carga solo las franjas con fecha de la semana visible (sin repetir en otras semanas). */
export function buildAvailabilityGridForWeek(
  saved: UserAvailabilitySlot[],
  weekMonday: Date,
  topicLookup?: Map<string, { title: string; licenseCode: string; licenseCategoryId: string }>,
): Map<string, AvailabilityCellData> {
  const map = createEmptyAvailabilityGridForWeek(weekMonday);
  for (const slot of saved) {
    if (!slot.available || !slot.slotDate) continue;
    const date = parseISO(slot.slotDate);
    if (!isDateInWorkWeek(date, weekMonday)) continue;
    const topicMeta =
      slot.theoryTopicId && topicLookup ? topicLookup.get(slot.theoryTopicId) : undefined;
    map.set(availabilityDateKey(date, slot.hour), {
      available: true,
      classType: slot.classType ?? 'PRACTICE',
      theoryTopicId: slot.theoryTopicId ?? null,
      theoryTopicTitle: topicMeta?.title,
      licenseCategoryId: slot.licenseCategoryId ?? topicMeta?.licenseCategoryId ?? null,
      licenseCategoryCode: topicMeta?.licenseCode,
      recurrence: slot.recurrence ?? 'WEEKLY',
      monthWeek: slot.monthWeek ?? null,
    });
  }
  return map;
}

/** Franjas verdes de la semana actual para guardar (cada una con su fecha). */
export function mapGridToAvailabilitySlotsForWeek(
  grid: Map<string, AvailabilityCellData>,
  weekColumns: WorkWeekColumn[],
): UserAvailabilitySlot[] {
  const slots: UserAvailabilitySlot[] = [];
  for (const col of weekColumns) {
    for (const hour of AVAILABILITY_HOURS) {
      const cell = grid.get(availabilityDateKey(col.date, hour));
      if (!cell?.available) continue;
      slots.push({
        dayOfWeek: col.dayOfWeek,
        slotDate: format(col.date, 'yyyy-MM-dd'),
        hour,
        available: true,
        classType: cell.classType,
        theoryTopicId: cell.classType === 'THEORY' ? cell.theoryTopicId ?? null : null,
        licenseCategoryId: cell.licenseCategoryId ?? null,
        recurrence: cell.recurrence,
        monthWeek: cell.monthWeek ?? null,
      });
    }
  }
  return slots;
}

/** Conserva franjas de otras semanas al guardar solo la semana visible. */
export function mergeAvailabilitySlotsForWeekSave(
  allSaved: UserAvailabilitySlot[],
  weekMonday: Date,
  weekColumns: WorkWeekColumn[],
  grid: Map<string, AvailabilityCellData>,
): UserAvailabilitySlot[] {
  const outsideWeek = allSaved.filter((slot) => {
    if (!slot.slotDate) return false;
    const date = parseISO(slot.slotDate);
    return !isDateInWorkWeek(date, weekMonday);
  });
  return [...outsideWeek, ...mapGridToAvailabilitySlotsForWeek(grid, weekColumns)];
}

export function templateToCellData(template: AvailabilitySlotTemplate): AvailabilityCellData {
  return {
    available: template.available,
    classType: template.classType,
    theoryTopicId: template.theoryTopicId ?? null,
    theoryTopicTitle: template.theoryTopicTitle,
    licenseCategoryId: template.licenseCategoryId ?? null,
    licenseCategoryCode: template.licenseCategoryCode,
    recurrence: template.recurrence,
    monthWeek: template.monthWeek ?? null,
  };
}

function withRecurrence(
  template: AvailabilitySlotTemplate,
  recurrence: AvailabilityRecurrence,
  monthWeek?: number | null,
): AvailabilitySlotTemplate {
  return {
    ...template,
    recurrence,
    monthWeek: recurrence === 'MONTHLY_NTH' ? (monthWeek ?? 1) : null,
  };
}

/** Aplica plantilla según alcance masivo. */
export function applyBulkAvailability(
  grid: Map<string, AvailabilityCellData>,
  template: AvailabilitySlotTemplate,
  scope: BulkApplyScope,
  options: {
    hour: number;
    dayOfWeek?: number;
    monthWeek?: number;
    lockedSlots: Set<string>;
    /** Si se define, solo se modifican estos días (p. ej. excluir fechas pasadas). */
    editableDayOfWeeks?: Set<number>;
  },
): Map<string, AvailabilityCellData> {
  const next = new Map(grid);
  const cellTemplate = templateToCellData(
    scope === 'WEEKLY'
      ? withRecurrence(template, 'WEEKLY')
      : scope === 'MONTHLY_NTH'
        ? withRecurrence(template, 'MONTHLY_NTH', options.monthWeek ?? 1)
        : scope === 'YEARLY'
          ? withRecurrence(template, 'YEARLY')
          : withRecurrence(template, template.recurrence),
  );

  const setIfUnlocked = (day: number, hour: number) => {
    if (options.editableDayOfWeeks && !options.editableDayOfWeeks.has(day)) return;
    const key = availabilitySlotKey(day, hour);
    if (options.lockedSlots.has(key)) return;
    next.set(key, {
      ...cellTemplate,
      available: template.available,
    });
  };

  switch (scope) {
    case 'WORK_WEEK':
      for (const col of WORK_WEEK_DAYS) {
        setIfUnlocked(col.dayOfWeek, options.hour);
      }
      break;
    case 'SINGLE_DAY':
      if (options.dayOfWeek != null) {
        setIfUnlocked(options.dayOfWeek, options.hour);
      }
      break;
    case 'WEEKLY':
      for (const col of WORK_WEEK_DAYS) {
        setIfUnlocked(col.dayOfWeek, options.hour);
      }
      break;
    case 'MONTHLY_NTH':
      if (options.dayOfWeek != null) {
        setIfUnlocked(options.dayOfWeek, options.hour);
      }
      break;
    case 'YEARLY':
      if (options.dayOfWeek != null) {
        setIfUnlocked(options.dayOfWeek, options.hour);
      }
      break;
    default:
      break;
  }

  return next;
}

export const BULK_APPLY_OPTIONS: {
  scope: BulkApplyScope;
  label: string;
  description: string;
}[] = [
  {
    scope: 'WORK_WEEK',
    label: 'Toda la semana laboral',
    description: 'Misma franja (lun–vie) a la hora elegida',
  },
  {
    scope: 'SINGLE_DAY',
    label: 'Este día',
    description: 'Solo el día seleccionado a esa hora',
  },
  {
    scope: 'WEEKLY',
    label: 'Cada semana',
    description: 'Se repite todas las semanas en ese día y hora',
  },
  {
    scope: 'MONTHLY_NTH',
    label: 'Cada mes (N-ésimo día)',
    description: 'Ej. tercer martes de cada mes',
  },
  {
    scope: 'YEARLY',
    label: 'Todo el año',
    description: 'Misma fecha relativa durante el año',
  },
];

export const MONTH_WEEK_OPTIONS = [
  { value: 1, label: 'Primera semana del mes' },
  { value: 2, label: 'Segunda semana del mes' },
  { value: 3, label: 'Tercera semana del mes' },
  { value: 4, label: 'Cuarta semana del mes' },
];
