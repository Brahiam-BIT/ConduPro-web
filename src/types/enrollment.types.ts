import type { LicenseCategory } from './curriculum.types';

export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface TheoryTopicProgressItem {
  id: string;
  title: string;
  sortOrder: number;
  completed: boolean;
  completedAt: string | null;
}

export interface EnrollmentProgress {
  enrollmentId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  licenseCategory: LicenseCategory;
  theoryRequired: number;
  theoryCompleted: number;
  practiceRequired: number;
  practiceCompleted: number;
  theoryPercent: number;
  practicePercent: number;
  overallPercent: number;
  isLicenseComplete: boolean;
  theoryTopics: TheoryTopicProgressItem[];
}

export interface CreateEnrollmentPayload {
  licenseCategoryId: string;
}
