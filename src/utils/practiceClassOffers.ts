import { format, parseISO, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { PracticeClassOffer } from '@/types/practiceClassOffers.types';

export interface PracticeClassInstructorGroup {
  instructorId: string;
  instructorName: string;
  licenseCategoryId: string;
  licenseCategoryCode: string;
  slots: PracticeClassOffer[];
}

export interface PracticeClassDayGroup {
  dateKey: string;
  dateLabel: string;
  instructors: PracticeClassInstructorGroup[];
  slotCount: number;
}

/** Agrupa ofertas prácticas: día → instructor → horarios. */
export function groupPracticeClassOffers(offers: PracticeClassOffer[]): PracticeClassDayGroup[] {
  const byDay = new Map<string, PracticeClassDayGroup>();

  for (const offer of offers) {
    const dateKey = format(startOfDay(parseISO(offer.startAt)), 'yyyy-MM-dd');
    let day = byDay.get(dateKey);
    if (!day) {
      day = {
        dateKey,
        dateLabel: format(parseISO(offer.startAt), "EEEE d 'de' MMMM", { locale: es }),
        instructors: [],
        slotCount: 0,
      };
      byDay.set(dateKey, day);
    }
    day.slotCount += 1;

    let instructor = day.instructors.find((i) => i.instructorId === offer.instructorId);
    if (!instructor) {
      instructor = {
        instructorId: offer.instructorId,
        instructorName: offer.instructorName,
        licenseCategoryId: offer.licenseCategoryId,
        licenseCategoryCode: offer.licenseCategoryCode,
        slots: [],
      };
      day.instructors.push(instructor);
    }
    instructor.slots.push(offer);
  }

  const days = [...byDay.values()];
  for (const day of days) {
    day.instructors.sort((a, b) => a.instructorName.localeCompare(b.instructorName));
    for (const inst of day.instructors) {
      inst.slots.sort(
        (a, b) => parseISO(a.startAt).getTime() - parseISO(b.startAt).getTime(),
      );
    }
  }

  return days.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}
