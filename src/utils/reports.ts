import {
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
  subMonths,
} from 'date-fns';

export type ReportPeriodPreset = 'month' | 'quarter' | 'year' | 'custom';

export interface ReportDateRange {
  startDate: string;
  endDate: string;
  label: string;
}

export function getReportPeriod(
  preset: ReportPeriodPreset,
  customFrom?: Date | null,
  customTo?: Date | null,
): ReportDateRange {
  const now = new Date();

  if (preset === 'month') {
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
      label: 'Este mes',
    };
  }

  if (preset === 'quarter') {
    const start = startOfMonth(subMonths(now, 2));
    const end = endOfMonth(now);
    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
      label: 'Último trimestre',
    };
  }

  if (preset === 'year') {
    const start = startOfYear(now);
    const end = endOfYear(now);
    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
      label: 'Este año',
    };
  }

  if (customFrom && customTo) {
    return {
      startDate: format(customFrom, 'yyyy-MM-dd'),
      endDate: format(customTo, 'yyyy-MM-dd'),
      label: 'Rango personalizado',
    };
  }

  const start = startOfMonth(now);
  const end = endOfMonth(now);
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
    label: 'Este mes',
  };
}

export function getLast30DaysRange(): ReportDateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
    label: 'Últimos 30 días',
  };
}
