import { api } from '@/lib/axios';
import { mapApiSchedule, type ApiSchedule } from '@/api/schedule.mapper';
import type { Schedule } from '@/types/schedule.types';
import type {
  JoinPracticeClassPayload,
  PracticeClassOffer,
  PracticeClassOffersFilters,
} from '@/types/practiceClassOffers.types';

export const practiceClassOffersApi = {
  async list(filters: PracticeClassOffersFilters = {}): Promise<PracticeClassOffer[]> {
    const { data } = await api.get<PracticeClassOffer[]>('/schedules/practice-offers', {
      params: filters,
    });
    return Array.isArray(data) ? data : [];
  },

  async join(payload: JoinPracticeClassPayload): Promise<Schedule> {
    const { data } = await api.post<ApiSchedule>('/schedules/practice-offers/join', payload);
    return mapApiSchedule(data);
  },
};
