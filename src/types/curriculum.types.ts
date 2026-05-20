export type LicenseGroup = 'A' | 'B' | 'C';

export interface LicenseCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  group: LicenseGroup;
  groupLabel: string;
  sortOrder: number;
  defaultTheoryCapacity: number;
  requiredPracticeSessions: number;
  requiresAllTheoryTopics: boolean;
  isActive: boolean;
  topicCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TheoryTopic {
  id: string;
  licenseCategoryId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  sessionCapacity: number;
  estimatedHours: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateLicenseCategoryPayload {
  name?: string;
  description?: string;
  defaultTheoryCapacity?: number;
  requiredPracticeSessions?: number;
  requiresAllTheoryTopics?: boolean;
  isActive?: boolean;
}

export interface TheoryTopicPayload {
  licenseCategoryId: string;
  title: string;
  description?: string;
  sortOrder?: number;
  sessionCapacity?: number;
  estimatedHours?: number;
  isActive?: boolean;
}
