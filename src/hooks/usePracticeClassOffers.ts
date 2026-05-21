import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { practiceClassOffersApi } from '@/api/practiceClassOffers.api';
import { enrollmentKeys } from '@/hooks/useStudentEnrollments';
import { studentScheduleKeys } from '@/hooks/useStudentSchedules';
import type {
  JoinPracticeClassPayload,
  PracticeClassOffer,
  PracticeClassOffersFilters,
} from '@/types/practiceClassOffers.types';

export const practiceClassOfferKeys = {
  all: ['practice-class-offers'] as const,
  list: (filters: PracticeClassOffersFilters) =>
    [...practiceClassOfferKeys.all, filters] as const,
};

export function usePracticeClassOffers(filters: PracticeClassOffersFilters = {}) {
  return useQuery({
    queryKey: practiceClassOfferKeys.list(filters),
    queryFn: () => practiceClassOffersApi.list(filters),
    meta: { skipGlobalErrorHandler: true },
  });
}

export function useJoinPracticeClass(filters: PracticeClassOffersFilters = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: JoinPracticeClassPayload) => practiceClassOffersApi.join(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceClassOfferKeys.list(filters) });
      queryClient.invalidateQueries({ queryKey: practiceClassOfferKeys.all });
      queryClient.invalidateQueries({ queryKey: studentScheduleKeys.all });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.mine() });
    },
  });
}

export function practiceOfferKey(offer: PracticeClassOffer): string {
  return `${offer.instructorId}|${offer.licenseCategoryId}|${offer.startAt}`;
}
