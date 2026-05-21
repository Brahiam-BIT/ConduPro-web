import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { theoryClassOffersApi } from '@/api/theoryClassOffers.api';
import { enrollmentKeys } from '@/hooks/useStudentEnrollments';
import type {
  JoinTheoryClassPayload,
  TheoryClassOffer,
  TheoryClassOffersFilters,
} from '@/types/theoryClassOffers.types';

export const theoryClassOfferKeys = {
  all: ['theory-class-offers'] as const,
  list: (filters: TheoryClassOffersFilters) =>
    [...theoryClassOfferKeys.all, filters] as const,
};

export function useTheoryClassOffers(filters: TheoryClassOffersFilters = {}) {
  return useQuery({
    queryKey: theoryClassOfferKeys.list(filters),
    queryFn: () => theoryClassOffersApi.list(filters),
    meta: { skipGlobalErrorHandler: true },
  });
}

export function useJoinTheoryClass(filters: TheoryClassOffersFilters = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: JoinTheoryClassPayload) => theoryClassOffersApi.join(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: theoryClassOfferKeys.list(filters) });
      queryClient.invalidateQueries({ queryKey: theoryClassOfferKeys.all });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.mine() });
    },
  });
}

export function offerSessionKey(offer: TheoryClassOffer): string {
  return `${offer.instructorId}|${offer.theoryTopicId}|${offer.startAt}`;
}
