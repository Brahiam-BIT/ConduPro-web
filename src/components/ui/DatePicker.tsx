import { useEffect, useMemo, useRef, useState } from 'react';
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useIsMobile } from '@/hooks/useMediaQuery';

/**
 * DatePicker
 * - Custom calendar popover (no external lib)
 * - Renders fullscreen sheet on mobile, dropdown on desktop
 * - Locale: Spanish (date-fns/locale/es)
 */
export interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  disabledDays?: (date: Date) => boolean;
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Selecciona una fecha',
  helperText,
  errorMessage,
  minDate,
  maxDate,
  disabled,
  disabledDays,
  id,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(value ?? new Date());
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (value) setViewDate(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (isMobile) return;
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, isMobile]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 });
    const arr: Date[] = [];
    let cursor = start;
    while (cursor <= end) {
      arr.push(cursor);
      cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    }
    return arr;
  }, [viewDate]);

  const isDayDisabled = (day: Date): boolean => {
    if (minDate && isBefore(day, stripTime(minDate))) return true;
    if (maxDate && isAfter(day, stripTime(maxDate))) return true;
    if (disabledDays?.(day)) return true;
    return false;
  };

  const today = stripTime(new Date());

  return (
    <div className="flex flex-col gap-1.5" ref={wrapperRef}>
      {label ? (
        <label htmlFor={id} className="text-label text-surface-700 dark:text-surface-200">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'flex h-11 w-full items-center gap-2 rounded-lg border bg-surface-50 px-3 text-left text-body-md transition-all duration-150 ease-smooth dark:bg-surface-900',
            errorMessage
              ? 'border-error-500 focus-visible:border-error-500 focus-visible:shadow-glow-error dark:border-error-500/70'
              : 'border-surface-300 focus-visible:border-primary-500 focus-visible:shadow-glow dark:border-surface-700',
            disabled && 'cursor-not-allowed opacity-60',
          )}
        >
          <Calendar className="h-4 w-4 shrink-0 text-surface-500 dark:text-surface-400" aria-hidden />
          <span className={cn('flex-1 truncate', value ? 'text-surface-900 dark:text-surface-100' : 'text-surface-400 dark:text-surface-500')}>
            {value ? format(value, "d 'de' MMMM, yyyy", { locale: es }) : placeholder}
          </span>
        </button>

        {open ? (
          <>
            {isMobile ? (
              <div
                className="fixed inset-0 z-50 flex items-end bg-surface-950/40 backdrop-blur-sm"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setOpen(false);
                }}
              >
                <div className="w-full rounded-t-xl bg-surface-50 p-4 animate-sheet-up dark:bg-surface-900">
                  <CalendarBody
                    viewDate={viewDate}
                    setViewDate={setViewDate}
                    days={days}
                    today={today}
                    selectedDate={value}
                    isDayDisabled={isDayDisabled}
                    onSelect={(d) => {
                      onChange(d);
                      setOpen(false);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="absolute left-0 top-full z-30 mt-2 w-[19.5rem] rounded-xl border border-surface-200 bg-surface-50 p-3 shadow-lg animate-scale-in dark:border-surface-800 dark:bg-surface-900">
                <CalendarBody
                  viewDate={viewDate}
                  setViewDate={setViewDate}
                  days={days}
                  today={today}
                  selectedDate={value}
                  isDayDisabled={isDayDisabled}
                  onSelect={(d) => {
                    onChange(d);
                    setOpen(false);
                  }}
                />
              </div>
            )}
          </>
        ) : null}
      </div>

      {errorMessage ? (
        <p className="text-caption text-error-600 dark:text-error-500" role="alert">
          {errorMessage}
        </p>
      ) : helperText ? (
        <p className="text-caption text-surface-500 dark:text-surface-400">{helperText}</p>
      ) : null}
    </div>
  );
}

function stripTime(d: Date): Date {
  const cleaned = new Date(d);
  cleaned.setHours(0, 0, 0, 0);
  return cleaned;
}

function CalendarBody({
  viewDate,
  setViewDate,
  days,
  today,
  selectedDate,
  isDayDisabled,
  onSelect,
}: {
  viewDate: Date;
  setViewDate: (d: Date) => void;
  days: Date[];
  today: Date;
  selectedDate: Date | null;
  isDayDisabled: (d: Date) => boolean;
  onSelect: (d: Date) => void;
}) {
  const weekdays = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(base.getTime() + i * 24 * 60 * 60 * 1000);
      return format(d, 'EEEEEE', { locale: es }).toUpperCase();
    });
  }, []);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewDate(subMonths(viewDate, 1))}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-surface-500 hover:bg-surface-200 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-200"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-body-sm font-semibold capitalize text-surface-800 dark:text-surface-100">
          {format(viewDate, "MMMM 'de' yyyy", { locale: es })}
        </p>
        <button
          type="button"
          onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-surface-500 hover:bg-surface-200 hover:text-surface-700 dark:hover:bg-surface-800 dark:hover:text-surface-200"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400">
        {weekdays.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, viewDate);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isToday = isSameDay(day, today);
          const disabled = isDayDisabled(day);
          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(day)}
              className={cn(
                'inline-flex h-9 items-center justify-center rounded-md text-body-sm transition-colors duration-150',
                !isCurrentMonth && 'text-surface-400 dark:text-surface-600',
                isCurrentMonth && !isSelected && 'text-surface-700 hover:bg-primary-50 hover:text-primary-700 dark:text-surface-200 dark:hover:bg-primary-900/30 dark:hover:text-primary-200',
                isSelected && 'bg-primary-600 text-white hover:bg-primary-700',
                isToday && !isSelected && 'ring-1 ring-primary-500',
                disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-current',
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function parseDateInput(value: string): Date | null {
  try {
    return parseISO(value);
  } catch {
    return null;
  }
}
