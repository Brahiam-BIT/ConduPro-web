export interface PracticeClassOffer {
  instructorId: string;
  instructorName: string;
  licenseCategoryId: string;
  licenseCategoryCode: string;
  startAt: string;
  endAt: string;
  vehicleHint: string | null;
}

export interface PracticeClassOffersFilters {
  licenseCategoryId?: string;
  fromDate?: string;
  days?: number;
}

export interface JoinPracticeClassPayload {
  instructorId: string;
  licenseCategoryId: string;
  startAt: string;
}
