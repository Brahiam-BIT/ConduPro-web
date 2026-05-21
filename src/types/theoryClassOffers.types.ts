export interface TheoryClassOfferStudent {
  id: string;
  firstName: string;
  lastName: string;
  assignedAt: string;
}

export interface TheoryClassOffer {
  instructorId: string;
  instructorName: string;
  theoryTopicId: string;
  theoryTopicTitle: string;
  licenseCategoryId: string;
  licenseCategoryCode: string;
  startAt: string;
  endAt: string;
  classroomId: string | null;
  classroomName: string;
  capacity: number;
  enrolledCount: number;
  spotsLeft: number;
  students: TheoryClassOfferStudent[];
  isEnrolled: boolean;
}

export interface TheoryClassOffersFilters {
  licenseCategoryId?: string;
  theoryTopicId?: string;
  fromDate?: string;
  days?: number;
}

export interface JoinTheoryClassPayload {
  instructorId: string;
  theoryTopicId: string;
  licenseCategoryId: string;
  startAt: string;
}
