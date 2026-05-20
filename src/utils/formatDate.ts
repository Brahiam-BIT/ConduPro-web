import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

function toDate(value: Date | string): Date {
  return typeof value === 'string' ? parseISO(value) : value;
}

export function formatDate(value: Date | string, pattern = "d 'de' MMMM, yyyy"): string {
  return format(toDate(value), pattern, { locale: es });
}

export function formatTime(value: Date | string): string {
  return format(toDate(value), 'HH:mm');
}

export function formatDateTime(value: Date | string): string {
  return format(toDate(value), "d MMM yyyy 'a las' HH:mm", { locale: es });
}

export function formatShortDate(value: Date | string): string {
  return format(toDate(value), 'dd/MM/yyyy');
}

export function formatRelative(value: Date | string): string {
  const date = toDate(value);
  if (isToday(date)) return `Hoy ${format(date, 'HH:mm')}`;
  if (isTomorrow(date)) return `Mañana ${format(date, 'HH:mm')}`;
  if (isYesterday(date)) return `Ayer ${format(date, 'HH:mm')}`;
  return formatDistanceToNow(date, { addSuffix: true, locale: es });
}

export function formatWeekday(value: Date | string): string {
  return format(toDate(value), 'EEEE', { locale: es });
}
