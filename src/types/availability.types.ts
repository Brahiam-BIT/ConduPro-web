export type AvailabilityClassType = 'THEORY' | 'PRACTICE';
export type AvailabilityRecurrence = 'WEEKLY' | 'MONTHLY_NTH' | 'YEARLY';

export interface UserAvailabilitySlot {
  dayOfWeek: number;
  /** Fecha concreta YYYY-MM-DD — solo ese día calendario. */
  slotDate?: string | null;
  hour: number;
  available: boolean;
  classType: AvailabilityClassType;
  theoryTopicId?: string | null;
  licenseCategoryId?: string | null;
  recurrence: AvailabilityRecurrence;
  monthWeek?: number | null;
}

export interface AvailabilityCellData {
  available: boolean;
  classType: AvailabilityClassType;
  theoryTopicId?: string | null;
  theoryTopicTitle?: string;
  licenseCategoryId?: string | null;
  licenseCategoryCode?: string;
  recurrence: AvailabilityRecurrence;
  monthWeek?: number | null;
}

export interface AvailabilitySlotTemplate {
  available: boolean;
  classType: AvailabilityClassType;
  theoryTopicId?: string | null;
  theoryTopicTitle?: string;
  licenseCategoryId?: string | null;
  licenseCategoryCode?: string;
  recurrence: AvailabilityRecurrence;
  monthWeek?: number | null;
}

export type BulkApplyScope =
  | 'WORK_WEEK'
  | 'SINGLE_DAY'
  | 'WEEKLY'
  | 'MONTHLY_NTH'
  | 'YEARLY';
