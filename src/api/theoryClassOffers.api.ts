import { api } from '@/lib/axios';
import { mapApiSchedule, type ApiSchedule } from '@/api/schedule.mapper';
import type { Schedule } from '@/types/schedule.types';
import type {
  JoinTheoryClassPayload,
  TheoryClassOffer,
  TheoryClassOffersFilters,
} from '@/types/theoryClassOffers.types';

export const theoryClassOffersApi = {
  async list(filters: TheoryClassOffersFilters = {}): Promise<TheoryClassOffer[]> {
    const { data } = await api.get<TheoryClassOffer[]>('/schedules/theory-offers', {
      params: filters,
    });
    return Array.isArray(data) ? data : [];
  },

  async join(payload: JoinTheoryClassPayload): Promise<Schedule> {
    const { data } = await api.post<ApiSchedule>('/schedules/theory-offers/join', payload);
    return mapApiSchedule(data);
  },
};
