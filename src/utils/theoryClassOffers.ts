import { format, parseISO, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TheoryClassOffer } from '@/types/theoryClassOffers.types';

export interface TheoryClassInstructorSession {
  instructorId: string;
  instructorName: string;
  classroomName: string;
  licenseCategoryId: string;
  licenseCategoryCode: string;
  theoryTopicId: string;
  theoryTopicTitle: string;
  slots: TheoryClassOffer[];
}

export interface TheoryClassDayGroup {
  dateKey: string;
  dateLabel: string;
  sessions: TheoryClassInstructorSession[];
  slotCount: number;
}

export interface TheoryClassTopicGroup {
  theoryTopicId: string;
  theoryTopicTitle: string;
  licenseCategoryCode: string;
  licenseCategoryId: string;
  days: TheoryClassDayGroup[];
  totalSlots: number;
}

/** Agrupa ofertas: tema → día → instructor/aula → horarios. */
export function groupTheoryClassOffers(offers: TheoryClassOffer[]): TheoryClassTopicGroup[] {
  const byTopic = new Map<string, TheoryClassTopicGroup>();

  for (const offer of offers) {
    let topic = byTopic.get(offer.theoryTopicId);
    if (!topic) {
      topic = {
        theoryTopicId: offer.theoryTopicId,
        theoryTopicTitle: offer.theoryTopicTitle,
        licenseCategoryCode: offer.licenseCategoryCode,
        licenseCategoryId: offer.licenseCategoryId,
        days: [],
        totalSlots: 0,
      };
      byTopic.set(offer.theoryTopicId, topic);
    }
    topic.totalSlots += 1;

    const dateKey = format(startOfDay(parseISO(offer.startAt)), 'yyyy-MM-dd');
    let day = topic.days.find((d) => d.dateKey === dateKey);
    if (!day) {
      day = {
        dateKey,
        dateLabel: format(parseISO(offer.startAt), "EEEE d 'de' MMMM", { locale: es }),
        sessions: [],
        slotCount: 0,
      };
      topic.days.push(day);
    }
    day.slotCount += 1;

    let session = day.sessions.find(
      (s) =>
        s.instructorId === offer.instructorId &&
        s.classroomName === offer.classroomName,
    );
    if (!session) {
      session = {
        instructorId: offer.instructorId,
        instructorName: offer.instructorName,
        classroomName: offer.classroomName,
        licenseCategoryId: offer.licenseCategoryId,
        licenseCategoryCode: offer.licenseCategoryCode,
        theoryTopicId: offer.theoryTopicId,
        theoryTopicTitle: offer.theoryTopicTitle,
        slots: [],
      };
      day.sessions.push(session);
    }
    session.slots.push(offer);
  }

  const topics = [...byTopic.values()];
  for (const topic of topics) {
    topic.days.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    for (const day of topic.days) {
      day.sessions.sort((a, b) => a.instructorName.localeCompare(b.instructorName));
      for (const session of day.sessions) {
        session.slots.sort(
          (a, b) => parseISO(a.startAt).getTime() - parseISO(b.startAt).getTime(),
        );
      }
    }
  }

  return topics.sort((a, b) =>
    `${a.licenseCategoryCode}-${a.theoryTopicTitle}`.localeCompare(
      `${b.licenseCategoryCode}-${b.theoryTopicTitle}`,
    ),
  );
}
